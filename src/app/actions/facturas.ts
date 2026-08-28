'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Marcar una factura como cobrada mueve plata en los reportes, así que el rol
// se valida dentro de la propia acción y no sólo por la ruta.
async function requireAdmin() {
  const session = await auth()
  const user = session?.user as any
  if (user?.role !== 'ADMIN') throw new Error('No autorizado')
}

export interface StoredLineItem {
  description: string
  subtitle: string
  period: string
  baseAmount: number
  hasIVA: boolean
  gastosAmount: number
  ivaAmount: number
  total: number
}

function revalidateAll() {
  revalidatePath('/admin/facturas')
  revalidatePath('/admin/ingresos')
  revalidatePath('/admin')
  revalidatePath('/client/facturas')
}

export async function createFactura(data: {
  companyId: string
  invoiceNumber: string
  invoiceDate: string
  period: string
  lineItemsJson: string
}) {
  await requireAdmin()

  let items: StoredLineItem[] = []
  try { items = JSON.parse(data.lineItemsJson) } catch {}

  const baseAmount = items.reduce((s, i) => s + i.baseAmount, 0)
  const iva = items.reduce((s, i) => s + i.ivaAmount, 0)
  const total = items.reduce((s, i) => s + i.total, 0)

  await prisma.serviceInvoice.create({
    data: {
      companyId: data.companyId,
      invoiceNumber: data.invoiceNumber || null,
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : null,
      period: data.period,
      lineItemsJson: items as any,
      baseAmount,
      iva,
      total,
      status: 'PENDING',
    },
  })

  revalidateAll()
}

export async function markFacturaSent(id: string, amountUSD: number, evidenceUrl: string) {
  await requireAdmin()

  await prisma.serviceInvoice.update({
    where: { id },
    data: {
      status: 'SENT',
      sentAmountUSD: amountUSD,
      sentEvidenceUrl: evidenceUrl || null,
      sentAt: new Date(),
    },
  })
  revalidateAll()
}

// El admin puede cobrar una factura en cualquier estado: si el cliente nunca
// reportó el envío (PENDING), puede registrar el cobro igual, con evidencia
// propia o sin ninguna.
//
// Confirmar el cobro además registra la plata como Income. Antes sólo se
// marcaba PAID y el dinero no aparecía nunca en Ingresos.
export async function confirmFacturaPaid(
  id: string,
  receivedAmountCOP: number,
  extra?: { sentAmountUSD?: number | null; evidenceUrl?: string | null },
) {
  await requireAdmin()

  if (!(receivedAmountCOP > 0)) {
    throw new Error('El monto recibido debe ser mayor que cero')
  }

  const factura = await prisma.serviceInvoice.findUnique({
    where: { id },
    select: {
      id: true, companyId: true, invoiceNumber: true, period: true,
      sentAmountUSD: true, incomeId: true,
      company: { select: { name: true } },
    },
  })
  if (!factura) throw new Error('Cuenta de cobro no encontrada')

  const recibidoAt = new Date()
  const etiqueta = `Cuenta de cobro ${factura.invoiceNumber ?? factura.period} — ${factura.company.name}`

  // El USD que aporta el admin manda sobre el que reportó el cliente
  const usd = extra?.sentAmountUSD != null ? extra.sentAmountUSD : factura.sentAmountUSD
  const trm = usd && usd > 0 ? receivedAmountCOP / usd : null

  await prisma.$transaction(async (tx) => {
    const datosFactura = {
      status: 'PAID',
      receivedAmountCOP,
      receivedAt: recibidoAt,
      paidAt: recibidoAt,
      // Sólo se escriben si el admin los aportó: una factura que el cliente ya
      // marcó como enviada conserva su monto en USD y su evidencia original.
      ...(extra?.sentAmountUSD != null ? { sentAmountUSD: extra.sentAmountUSD } : {}),
      ...(extra?.evidenceUrl ? { sentEvidenceUrl: extra.evidenceUrl } : {}),
    }

    if (factura.incomeId) {
      // Ya tenía ingreso: se corrige en vez de duplicarlo
      await tx.income.update({
        where: { id: factura.incomeId },
        data: {
          amountCOP: receivedAmountCOP,
          amountUSD: usd,
          exchangeRate: trm,
          description: etiqueta,
        },
      })
      await tx.serviceInvoice.update({ where: { id }, data: datosFactura })
      return
    }

    const income = await tx.income.create({
      data: {
        companyId: factura.companyId,
        date: recibidoAt,
        amountCOP: receivedAmountCOP,
        amountUSD: usd,
        exchangeRate: trm,
        platform: 'WISE',
        description: etiqueta,
      },
      select: { id: true },
    })

    await tx.serviceInvoice.update({
      where: { id },
      data: { ...datosFactura, incomeId: income.id },
    })
  })

  revalidateAll()
}

// Borrar la cuenta de cobro borra también el ingreso que generó,
// para que el saldo no quede inflado.
export async function deleteFactura(id: string) {
  await requireAdmin()

  const factura = await prisma.serviceInvoice.findUnique({
    where: { id },
    select: { incomeId: true },
  })

  await prisma.$transaction(async (tx) => {
    await tx.serviceInvoice.delete({ where: { id } })
    if (factura?.incomeId) {
      await tx.income.delete({ where: { id: factura.incomeId } })
    }
  })

  revalidateAll()
}
