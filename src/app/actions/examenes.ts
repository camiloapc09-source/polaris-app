'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createExamen(data: {
  employeeId: string
  type: string
  examDate: string
  nextExamDate?: string
  clinic?: string
  result: string
  evidenceUrl?: string
  notes?: string
}) {
  await prisma.examenMedico.create({
    data: {
      employeeId: data.employeeId,
      type: data.type,
      examDate: new Date(data.examDate),
      nextExamDate: data.nextExamDate ? new Date(data.nextExamDate) : null,
      clinic: data.clinic || null,
      result: data.result,
      evidenceUrl: data.evidenceUrl || null,
      notes: data.notes || null,
    },
  })
  revalidatePath('/admin/examenes')
  revalidatePath('/client/examenes')
}

export async function updateExamen(id: string, data: {
  result?: string
  evidenceUrl?: string
  notes?: string
  nextExamDate?: string
}) {
  await prisma.examenMedico.update({
    where: { id },
    data: {
      result: data.result,
      evidenceUrl: data.evidenceUrl || null,
      notes: data.notes || null,
      nextExamDate: data.nextExamDate ? new Date(data.nextExamDate) : undefined,
    },
  })
  revalidatePath('/admin/examenes')
  revalidatePath('/client/examenes')
}
