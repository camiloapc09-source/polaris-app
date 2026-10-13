'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const TYPES = ['GENERAL', 'ESPECIALISTA', 'ODONTOLOGIA', 'EXAMENES', 'TERAPIA', 'OTRO']

function revalidateAll() {
  revalidatePath('/employee/citas')
  revalidatePath('/admin/citas')
  revalidatePath('/client/citas')
}

// El input datetime-local llega sin zona ("2026-10-14T09:30"). Colombia no
// tiene horario de verano, así que se interpreta siempre como UTC-5.
function parseBogota(value: string) {
  const d = new Date(`${value}:00-05:00`)
  if (isNaN(d.getTime())) throw new Error('Fecha y hora inválidas')
  return d
}

// El empleado reporta una cita médica → queda PENDING para Star Shine
export async function createCitaMedica(data: {
  type: string
  appointmentAt: string
  durationHours?: string
  place?: string
  reason?: string
  documentUrl?: string
}) {
  const session = await auth()
  const user = session?.user as any
  const employeeId = user?.employeeId
  if (!employeeId) throw new Error('No autorizado')

  if (!data.appointmentAt) throw new Error('Debes indicar la fecha y hora de la cita')
  const duration = data.durationHours ? parseFloat(data.durationHours) : null
  if (duration !== null && (isNaN(duration) || duration <= 0 || duration > 24)) {
    throw new Error('La duración debe estar entre 0 y 24 horas')
  }

  await prisma.citaMedica.create({
    data: {
      employeeId,
      type: TYPES.includes(data.type) ? data.type : 'OTRO',
      appointmentAt: parseBogota(data.appointmentAt),
      durationHours: duration,
      place: data.place?.trim() || null,
      reason: data.reason?.trim() || null,
      documentUrl: data.documentUrl || null,
    },
  })
  revalidateAll()
}

// El empleado cancela su propia solicitud mientras siga pendiente
export async function cancelCitaMedica(id: string) {
  const session = await auth()
  const user = session?.user as any
  const employeeId = user?.employeeId
  if (!employeeId) throw new Error('No autorizado')

  const cita = await prisma.citaMedica.findUnique({ where: { id }, select: { employeeId: true, status: true } })
  if (!cita || cita.employeeId !== employeeId) throw new Error('No autorizado')
  if (cita.status !== 'PENDING') throw new Error('Sólo puedes cancelar solicitudes pendientes')

  await prisma.citaMedica.update({ where: { id }, data: { status: 'CANCELLED' } })
  revalidateAll()
}

// Star Shine aprueba o rechaza la cita
export async function reviewCitaMedica(id: string, data: {
  status: 'APPROVED' | 'REJECTED'
  adminNote?: string
}) {
  const session = await auth()
  const user = session?.user as any
  if (user?.role !== 'ADMIN') throw new Error('No autorizado')
  if (data.status !== 'APPROVED' && data.status !== 'REJECTED') throw new Error('Estado inválido')

  const cita = await prisma.citaMedica.findUnique({ where: { id }, select: { status: true } })
  if (!cita) throw new Error('La cita no existe')
  if (cita.status === 'CANCELLED') throw new Error('El empleado canceló esta solicitud')

  await prisma.citaMedica.update({
    where: { id },
    data: {
      status: data.status,
      adminNote: data.adminNote?.trim() || null,
      reviewedAt: new Date(),
    },
  })
  revalidateAll()
}
