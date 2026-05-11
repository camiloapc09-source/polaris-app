'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createPrograma(data: {
  title: string
  category: string
  description?: string
  provider?: string
  schedule?: string
  capacity?: string
  companyId: string
}) {
  await prisma.programaBienestar.create({
    data: {
      title: data.title,
      category: data.category,
      description: data.description || null,
      provider: data.provider || null,
      schedule: data.schedule || null,
      capacity: data.capacity ? parseInt(data.capacity) : null,
      companyId: data.companyId,
    },
  })
  revalidatePath('/admin/bienestar')
  revalidatePath('/client/bienestar')
  revalidatePath('/employee/bienestar')
}

export async function toggleProgramaStatus(id: string, current: boolean) {
  await prisma.programaBienestar.update({
    where: { id },
    data: { isActive: !current },
  })
  revalidatePath('/admin/bienestar')
  revalidatePath('/client/bienestar')
  revalidatePath('/employee/bienestar')
}

export async function toggleInscripcion(programaId: string) {
  const session = await auth()
  const user = session?.user as any
  const employeeId = user?.employeeId
  if (!employeeId) throw new Error('No autorizado')

  const existing = await prisma.inscripcionBienestar.findUnique({
    where: { programaId_employeeId: { programaId, employeeId } },
  })

  if (existing) {
    await prisma.inscripcionBienestar.delete({
      where: { programaId_employeeId: { programaId, employeeId } },
    })
  } else {
    await prisma.inscripcionBienestar.create({
      data: { programaId, employeeId },
    })
  }
  revalidatePath('/employee/bienestar')
}
