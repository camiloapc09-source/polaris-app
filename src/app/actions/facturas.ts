'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

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

export async function createFactura(data: {
  companyId: string
  invoiceNumber: string
  invoiceDate: string
  period: string
  lineItemsJson: string
}) {
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

  revalidatePath('/admin/facturas')
  revalidatePath('/client/facturas')
}

export async function markFacturaSent(id: string, amountUSD: number, evidenceUrl: string) {
  await prisma.serviceInvoice.update({
    where: { id },
    data: {
      status: 'SENT',
      sentAmountUSD: amountUSD,
      sentEvidenceUrl: evidenceUrl || null,
      sentAt: new Date(),
    },
  })
  revalidatePath('/admin/facturas')
  revalidatePath('/client/facturas')
}

export async function confirmFacturaPaid(id: string, receivedAmountCOP: number) {
  await prisma.serviceInvoice.update({
    where: { id },
    data: {
      status: 'PAID',
      receivedAmountCOP,
      receivedAt: new Date(),
      paidAt: new Date(),
    },
  })
  revalidatePath('/admin/facturas')
  revalidatePath('/client/facturas')
}

export async function deleteFactura(id: string) {
  await prisma.serviceInvoice.delete({ where: { id } })
  revalidatePath('/admin/facturas')
  revalidatePath('/client/facturas')
}
