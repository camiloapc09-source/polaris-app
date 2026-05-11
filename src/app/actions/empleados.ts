'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createEmployee(data: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  position: string
  startDate: string
  salary: string
  companyId: string
  cedula?: string
  bankName?: string
  bankAccount?: string
  conectividadDefault?: string
  toolsDefault?: string
}) {
  await prisma.employee.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      position: data.position,
      startDate: new Date(data.startDate),
      salary: parseFloat(data.salary) || 0,
      companyId: data.companyId,
      cedula: data.cedula || null,
      bankName: data.bankName || null,
      bankAccount: data.bankAccount || null,
      conectividadDefault: parseFloat(data.conectividadDefault || '0'),
      toolsDefault: parseFloat(data.toolsDefault || '0'),
    },
  })
  revalidatePath('/admin/empleados')
}

export async function updateEmployeeStatus(id: string, status: string) {
  await prisma.employee.update({ where: { id }, data: { status } })
  revalidatePath('/admin/empleados')
}
