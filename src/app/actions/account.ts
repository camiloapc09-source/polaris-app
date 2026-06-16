'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

// Cualquier usuario cambia su propia contraseña (requiere la actual)
export async function cambiarPropiaPassword(data: {
  currentPassword: string
  newPassword: string
}) {
  const session = await auth()
  const user = session?.user as any
  const userId = user?.id
  if (!userId) throw new Error('No autorizado')

  if (!data.currentPassword || !data.newPassword) {
    throw new Error('Debes completar todos los campos')
  }
  if (data.newPassword.length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres')
  }

  const dbUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!dbUser) throw new Error('Usuario no encontrado')

  const valid = await bcrypt.compare(data.currentPassword, dbUser.password)
  if (!valid) throw new Error('La contraseña actual es incorrecta')

  const hashed = await bcrypt.hash(data.newPassword, 10)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
}

// Solo Star Shine (ADMIN) restablece la contraseña de cualquier usuario
export async function adminResetPassword(data: {
  userId: string
  newPassword: string
}) {
  const session = await auth()
  const actor = session?.user as any
  if (actor?.role !== 'ADMIN') throw new Error('No autorizado')

  if (!data.newPassword || data.newPassword.length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres')
  }

  const hashed = await bcrypt.hash(data.newPassword, 10)
  await prisma.user.update({ where: { id: data.userId }, data: { password: hashed } })
  revalidatePath('/admin/accesos')
}
