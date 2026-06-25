'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createAporte(data: {
  employeeId: string
  period: string
  health: string
  pension: string
  arl: string
  caja: string
  lateFee: string
  voucherUrl?: string
}) {
  const health   = parseFloat(data.health)   || 0
  const pension  = parseFloat(data.pension)  || 0
  const arl      = parseFloat(data.arl)      || 0
  const caja     = parseFloat(data.caja)     || 0
  const lateFee  = parseFloat(data.lateFee)  || 0
  const total    = health + pension + arl + caja + lateFee

  await prisma.socialContribution.create({
    data: {
      employeeId: data.employeeId,
      period: data.period,
      health, pension, arl, caja, lateFee, total,
      status: 'PENDING',
      voucherUrl: data.voucherUrl || null,
    },
  })

  revalidatePath('/admin/aportes')
}

export async function markAportePaid(id: string, voucherUrl?: string) {
  await prisma.socialContribution.update({
    where: { id },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      ...(voucherUrl ? { voucherUrl } : {}),
    },
  })
  revalidatePath('/admin/aportes')
}

export async function deleteAporte(id: string) {
  await prisma.socialContribution.delete({ where: { id } })
  revalidatePath('/admin/aportes')
}
