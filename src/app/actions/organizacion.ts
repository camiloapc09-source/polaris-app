'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Crear empresas y usuarios son las acciones más sensibles de la app:
// todas validan el rol dentro de la propia acción, no sólo por la ruta.
async function requireAdmin() {
  const session = await auth()
  const user = session?.user as any
  if (user?.role !== 'ADMIN') throw new Error('No autorizado')
  return user as { id: string; role: string }
}

// ── Empresas cliente ──────────────────────────────────────────────────────

const companySchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(160),
  country: z.string().trim().min(2, 'Indica el país').max(60),
  currency: z.string().trim().min(3, 'La moneda debe tener 3 letras').max(3)
    .transform((v) => v.toUpperCase()),
  contactName: z.string().trim().max(160).optional(),
  contactEmail: z.string().trim().email('Correo de contacto inválido').optional().or(z.literal('')),
})

export async function createCompany(data: {
  name: string
  country: string
  currency: string
  contactName?: string
  contactEmail?: string
}) {
  await requireAdmin()

  const parsed = companySchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const duplicada = await prisma.company.findFirst({
    where: { name: { equals: parsed.data.name, mode: 'insensitive' } },
    select: { id: true },
  })
  if (duplicada) throw new Error(`Ya existe un cliente llamado "${parsed.data.name}"`)

  const company = await prisma.company.create({
    data: {
      name: parsed.data.name,
      country: parsed.data.country,
      currency: parsed.data.currency,
      contactName: parsed.data.contactName?.trim() || null,
      contactEmail: parsed.data.contactEmail?.trim() || null,
    },
    select: { id: true },
  })

  revalidatePath('/admin/clientes')
  revalidatePath('/admin/empleados')
  revalidatePath('/admin/accesos')
  revalidatePath('/admin/facturas')
  return { id: company.id }
}

// ── Usuarios (accesos) ────────────────────────────────────────────────────

const userSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(160),
  email: z.string().trim().toLowerCase().email('Correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(200),
  role: z.enum(['ADMIN', 'CLIENT', 'EMPLOYEE']),
  companyId: z.string().optional(),
  employeeId: z.string().optional(),
})

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: string
  companyId?: string
  employeeId?: string
}) {
  await requireAdmin()

  const parsed = userSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)
  const { name, email, password, role } = parsed.data

  const existente = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existente) throw new Error(`Ya hay un usuario con el correo ${email}`)

  // Cada rol necesita su vínculo: sin esto el usuario entra pero no ve nada suyo.
  let companyId: string | null = null
  let employeeId: string | null = null

  if (role === 'CLIENT') {
    if (!parsed.data.companyId) throw new Error('Un usuario de cliente debe estar asociado a una empresa')
    const company = await prisma.company.findUnique({
      where: { id: parsed.data.companyId },
      select: { id: true },
    })
    if (!company) throw new Error('La empresa seleccionada no existe')
    companyId = company.id
  }

  if (role === 'EMPLOYEE') {
    if (!parsed.data.employeeId) throw new Error('Un usuario de empleado debe estar asociado a un trabajador')
    const employee = await prisma.employee.findUnique({
      where: { id: parsed.data.employeeId },
      select: { id: true, companyId: true, user: { select: { id: true } } },
    })
    if (!employee) throw new Error('El trabajador seleccionado no existe')
    // Employee.user es una relación 1-a-1 (User.employeeId es @unique)
    if (employee.user) throw new Error('Ese trabajador ya tiene un usuario asignado')
    employeeId = employee.id
    companyId = employee.companyId
  }

  const hashed = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: { name, email, password: hashed, role, companyId, employeeId },
  })

  revalidatePath('/admin/accesos')
  revalidatePath('/admin/clientes')
}
