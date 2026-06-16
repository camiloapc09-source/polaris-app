'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

function revalidateAll() {
  revalidatePath('/admin/examenes')
  revalidatePath('/client/examenes')
  revalidatePath('/employee/examenes')
}

// Star Shine programa un examen para un empleado → estado PROGRAMADO
export async function createExamen(data: {
  employeeId: string
  type: string
  clinic?: string
  notes?: string
  nextExamDate?: string
}) {
  await prisma.examenMedico.create({
    data: {
      employeeId: data.employeeId,
      type: data.type,
      status: 'PROGRAMADO',
      result: 'PENDIENTE',
      clinic: data.clinic || null,
      notes: data.notes || null,
      nextExamDate: data.nextExamDate ? new Date(data.nextExamDate) : null,
    },
  })
  revalidateAll()
}

// El empleado agenda la cita con su EPS → estado CITA_AGENDADA
export async function agendarCita(id: string, data: {
  appointmentAt: string
  clinic?: string
}) {
  const session = await auth()
  const user = session?.user as any
  const employeeId = user?.employeeId
  if (!employeeId) throw new Error('No autorizado')

  // Asegurar que el examen pertenece al empleado autenticado
  const examen = await prisma.examenMedico.findUnique({ where: { id }, select: { employeeId: true } })
  if (!examen || examen.employeeId !== employeeId) throw new Error('No autorizado')

  if (!data.appointmentAt) throw new Error('Debes indicar la fecha y hora de la cita')

  await prisma.examenMedico.update({
    where: { id },
    data: {
      status: 'CITA_AGENDADA',
      appointmentAt: new Date(data.appointmentAt),
      clinic: data.clinic || undefined,
    },
  })
  revalidateAll()
}

// El empleado registra el resultado y sube la historia clínica → estado REALIZADO
export async function registrarResultado(id: string, data: {
  result: string
  evidenceUrl?: string
  examDate?: string
  notes?: string
}) {
  const session = await auth()
  const user = session?.user as any
  const employeeId = user?.employeeId
  if (!employeeId) throw new Error('No autorizado')

  const examen = await prisma.examenMedico.findUnique({ where: { id }, select: { employeeId: true, appointmentAt: true } })
  if (!examen || examen.employeeId !== employeeId) throw new Error('No autorizado')

  await prisma.examenMedico.update({
    where: { id },
    data: {
      status: 'REALIZADO',
      result: data.result,
      evidenceUrl: data.evidenceUrl || undefined,
      examDate: data.examDate ? new Date(data.examDate) : (examen.appointmentAt ?? new Date()),
    },
  })
  revalidateAll()
}

// Star Shine puede editar / completar manualmente un examen
export async function updateExamen(id: string, data: {
  status?: string
  result?: string
  evidenceUrl?: string
  notes?: string
  nextExamDate?: string
}) {
  await prisma.examenMedico.update({
    where: { id },
    data: {
      status: data.status,
      result: data.result,
      evidenceUrl: data.evidenceUrl || undefined,
      notes: data.notes ?? undefined,
      nextExamDate: data.nextExamDate ? new Date(data.nextExamDate) : undefined,
    },
  })
  revalidateAll()
}

export async function deleteExamen(id: string) {
  await prisma.examenMedico.delete({ where: { id } })
  revalidateAll()
}
