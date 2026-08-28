'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createIncome(data: {
  date: string
  amountUSD?: string
  exchangeRate?: string
  amountCOP: string
  platform: string
  description?: string
  companyId: string
}) {
  const session = await auth()
  const user = session?.user as any
  if (user?.role !== 'ADMIN') throw new Error('No autorizado')

  if (!data.companyId) throw new Error('Debes seleccionar el cliente')

  const company = await prisma.company.findUnique({
    where: { id: data.companyId },
    select: { id: true },
  })
  if (!company) throw new Error('El cliente seleccionado no existe')

  const amountCOP = parseFloat(data.amountCOP)
  if (!(amountCOP > 0)) throw new Error('El monto en COP debe ser mayor que cero')

  await prisma.income.create({
    data: {
      date: new Date(data.date),
      amountUSD: data.amountUSD ? parseFloat(data.amountUSD) : null,
      exchangeRate: data.exchangeRate ? parseFloat(data.exchangeRate) : null,
      amountCOP,
      platform: data.platform || 'WISE',
      description: data.description || null,
      companyId: company.id,
    },
  })

  revalidatePath('/admin/ingresos')
  revalidatePath('/admin')
}
