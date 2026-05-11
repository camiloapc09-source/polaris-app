'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createFactura(data: {
  companyId: string
  period: string
  baseAmount: string
  iva: string
  invoiceRef: string
}) {
  const base = parseFloat(data.baseAmount) || 0
  const iva  = parseFloat(data.iva) || 0
  const total = base + iva

  await prisma.serviceInvoice.create({
    data: {
      companyId: data.companyId,
      period: data.period,
      baseAmount: base,
      iva,
      total,
      invoiceRef: data.invoiceRef || null,
      status: 'PENDING',
    },
  })

  revalidatePath('/admin/facturas')
}

export async function markFacturaPaid(id: string) {
  await prisma.serviceInvoice.update({
    where: { id },
    data: { status: 'PAID', paidAt: new Date() },
  })
  revalidatePath('/admin/facturas')
}

export async function deleteFactura(id: string) {
  await prisma.serviceInvoice.delete({ where: { id } })
  revalidatePath('/admin/facturas')
}
