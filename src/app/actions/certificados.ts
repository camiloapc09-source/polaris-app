'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function requestCertificado(data: {
  type: string
  requestNote?: string
}) {
  const session = await auth()
  const user = session?.user as any
  const employeeId = user?.employeeId
  if (!employeeId) throw new Error('No autorizado')

  await prisma.certificadoLaboral.create({
    data: {
      type: data.type,
      requestNote: data.requestNote || null,
      employeeId,
    },
  })
  revalidatePath('/employee/certificados')
}

export async function updateCertificado(id: string, data: {
  status: string
  adminNote?: string
  documentUrl?: string
}) {
  await prisma.certificadoLaboral.update({
    where: { id },
    data: {
      status: data.status,
      adminNote: data.adminNote || null,
      documentUrl: data.documentUrl || null,
    },
  })
  revalidatePath('/admin/certificados')
  revalidatePath('/employee/certificados')
}
