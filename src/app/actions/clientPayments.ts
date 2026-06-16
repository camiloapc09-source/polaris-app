'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createClientPayment(data: {
  amountUSD: string
  date: string
  description?: string
  evidenceUrl?: string
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  const user = session?.user as any
  if (!user?.companyId) return { success: false, error: 'Sin acceso' }

  await prisma.clientPayment.create({
    data: {
      companyId: user.companyId,
      amountUSD: parseFloat(data.amountUSD),
      date: new Date(data.date),
      description: data.description || null,
      evidenceUrl: data.evidenceUrl || null,
      status: 'PENDING',
    },
  })

  revalidatePath('/client/pagos')
  revalidatePath('/admin/ingresos')
  return { success: true }
}

export async function confirmClientPayment(data: {
  clientPaymentId: string
  amountCOP: string
  exchangeRate?: string
  platform?: string
  description?: string
}): Promise<{ success: boolean }> {
  const session = await auth()
  const user = session?.user as any
  if (user?.role !== 'ADMIN') return { success: false }

  const cp = await prisma.clientPayment.findUnique({
    where: { id: data.clientPaymentId },
  })
  if (!cp) return { success: false }

  const income = await prisma.income.create({
    data: {
      companyId: cp.companyId,
      date: cp.date,
      amountUSD: cp.amountUSD,
      amountCOP: parseFloat(data.amountCOP),
      exchangeRate: data.exchangeRate ? parseFloat(data.exchangeRate) : null,
      platform: data.platform || 'WISE',
      description: data.description || cp.description || null,
    },
  })

  await prisma.clientPayment.update({
    where: { id: data.clientPaymentId },
    data: { status: 'CONFIRMED', incomeId: income.id },
  })

  revalidatePath('/admin/ingresos')
  revalidatePath('/client/pagos')
  return { success: true }
}
