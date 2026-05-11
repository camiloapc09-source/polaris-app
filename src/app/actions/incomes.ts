'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createIncome(data: {
  date: string
  amountUSD?: string
  exchangeRate?: string
  amountCOP: string
  platform: string
  description?: string
}) {
  await prisma.income.create({
    data: {
      date: new Date(data.date),
      amountUSD: data.amountUSD ? parseFloat(data.amountUSD) : null,
      exchangeRate: data.exchangeRate ? parseFloat(data.exchangeRate) : null,
      amountCOP: parseFloat(data.amountCOP),
      platform: data.platform || 'WISE',
      description: data.description || null,
      companyId: 'kover-solutions',
    },
  })

  revalidatePath('/admin/ingresos')
}
