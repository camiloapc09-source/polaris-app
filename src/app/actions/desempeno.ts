'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// ── Tipos y validación ────────────────────────────────────────────────────

// Un ítem del checklist tal como se guarda en PerformanceReview.checklistJson
export interface ChecklistItem {
  taskName: string
  completed: boolean
  note?: string
}

const checklistItemSchema = z.object({
  taskName: z.string().min(1, 'La tarea no puede estar vacía'),
  completed: z.boolean(),
  note: z.string().trim().max(1000).optional(),
})

const createSchema = z.object({
  employeeId: z.string().min(1, 'Debes seleccionar un trabajador'),
  // "YYYY-MM"
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'El período debe tener formato YYYY-MM'),
})

const updateSchema = z.object({
  id: z.string().min(1),
  checklistJson: z.array(checklistItemSchema).min(1, 'El checklist no puede estar vacío'),
  observations: z.string().trim().max(4000).optional(),
})

// ── Helpers ───────────────────────────────────────────────────────────────

// Este proyecto tiene varias acciones de admin que NO revalidan el rol dentro
// de la acción (quedan protegidas sólo por vivir bajo /admin). Aquí sí se valida.
async function requireAdmin() {
  const session = await auth()
  const user = session?.user as any
  if (user?.role !== 'ADMIN') throw new Error('No autorizado')
  if (!user?.id) throw new Error('Sesión inválida')
  return user as { id: string; role: string }
}

function calcCompletion(items: ChecklistItem[]): number {
  if (items.length === 0) return 0
  const done = items.filter((i) => i.completed).length
  return Math.round((done / items.length) * 1000) / 10 // 1 decimal
}

function revalidateAll(employeeId?: string) {
  revalidatePath('/admin/desempeno')
  revalidatePath('/employee/desempeno')
  if (employeeId) revalidatePath(`/admin/desempeno/${employeeId}`)
}

function revalidatePlantillas() {
  revalidatePath('/admin/plantillas')
  revalidatePath('/admin/desempeno')
}

// ── Acciones ──────────────────────────────────────────────────────────────

// Crea la revisión del mes copiando la plantilla activa del cargo del trabajador.
// El snapshot queda congelado en checklistJson: si luego cambia la plantilla,
// las revisiones ya creadas no se alteran (mismo criterio que ServiceInvoice.lineItemsJson).
export async function createPerformanceReview(employeeId: string, period: string) {
  const admin = await requireAdmin()

  const parsed = createSchema.safeParse({ employeeId, period })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const employee = await prisma.employee.findUnique({
    where: { id: parsed.data.employeeId },
    select: { id: true, position: true, firstName: true, lastName: true },
  })
  if (!employee) throw new Error('Trabajador no encontrado')

  const yaExiste = await prisma.performanceReview.findUnique({
    where: { employeeId_period: { employeeId: employee.id, period: parsed.data.period } },
    select: { id: true },
  })
  if (yaExiste) throw new Error(`Ya existe una revisión de ${parsed.data.period} para este trabajador`)

  const plantilla = await prisma.checklistTemplate.findMany({
    where: { position: employee.position, isActive: true },
    orderBy: { order: 'asc' },
    select: { taskName: true },
  })

  if (plantilla.length === 0) {
    throw new Error(
      `No hay plantilla de tareas activa para el cargo "${employee.position}". ` +
      `Crea la plantilla de ese cargo antes de hacer la revisión.`
    )
  }

  const checklist: ChecklistItem[] = plantilla.map((t) => ({
    taskName: t.taskName,
    completed: false,
  }))

  const review = await prisma.performanceReview.create({
    data: {
      employeeId: employee.id,
      period: parsed.data.period,
      checklistJson: checklist as any,
      completionPercent: 0,
      reviewedById: admin.id,
      reviewedAt: new Date(),
      status: 'DRAFT',
    },
    select: { id: true },
  })

  revalidateAll(employee.id)
  return { id: review.id, checklist }
}

// Guarda el checklist diligenciado y cierra la revisión.
// reviewedById/reviewedAt se sobrescriben con quién y cuándo firmó realmente.
export async function updatePerformanceReview(
  id: string,
  checklistJson: ChecklistItem[],
  observations?: string,
) {
  const admin = await requireAdmin()

  const parsed = updateSchema.safeParse({ id, checklistJson, observations })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const existing = await prisma.performanceReview.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, employeeId: true },
  })
  if (!existing) throw new Error('Revisión no encontrada')

  const items = parsed.data.checklistJson

  await prisma.performanceReview.update({
    where: { id: parsed.data.id },
    data: {
      checklistJson: items as any,
      completionPercent: calcCompletion(items),
      observations: parsed.data.observations?.trim() || null,
      reviewedById: admin.id,
      reviewedAt: new Date(),
      status: 'COMPLETED',
    },
  })

  revalidateAll(existing.employeeId)
}

// ── Plantillas de checklist por cargo ─────────────────────────────────────
// Ojo: editar una plantilla NO altera revisiones ya creadas — cada revisión
// guarda su propio snapshot en checklistJson.

const positionSchema = z.string().trim().min(2, 'El cargo debe tener al menos 2 caracteres').max(120)
const taskNameSchema = z.string().trim().min(3, 'La tarea debe tener al menos 3 caracteres').max(300)

// Agrega una tarea al final de la plantilla de un cargo.
// Si el cargo no existía, esto lo crea de hecho.
export async function addTemplateTask(position: string, taskName: string) {
  await requireAdmin()

  const parsed = z.object({ position: positionSchema, taskName: taskNameSchema })
    .safeParse({ position, taskName })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const duplicada = await prisma.checklistTemplate.findFirst({
    where: { position: parsed.data.position, taskName: parsed.data.taskName },
    select: { id: true },
  })
  if (duplicada) throw new Error('Esa tarea ya existe en este cargo')

  const ultima = await prisma.checklistTemplate.findFirst({
    where: { position: parsed.data.position },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  await prisma.checklistTemplate.create({
    data: {
      position: parsed.data.position,
      taskName: parsed.data.taskName,
      order: (ultima?.order ?? 0) + 1,
      isActive: true,
    },
  })
  revalidatePlantillas()
}

export async function updateTemplateTask(id: string, taskName: string) {
  await requireAdmin()

  const parsed = taskNameSchema.safeParse(taskName)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  await prisma.checklistTemplate.update({
    where: { id },
    data: { taskName: parsed.data },
  })
  revalidatePlantillas()
}

export async function toggleTemplateTask(id: string) {
  await requireAdmin()

  const actual = await prisma.checklistTemplate.findUnique({
    where: { id },
    select: { isActive: true },
  })
  if (!actual) throw new Error('Tarea no encontrada')

  await prisma.checklistTemplate.update({
    where: { id },
    data: { isActive: !actual.isActive },
  })
  revalidatePlantillas()
}

export async function deleteTemplateTask(id: string) {
  await requireAdmin()
  await prisma.checklistTemplate.delete({ where: { id } })
  revalidatePlantillas()
}

// Copia todas las tareas de un cargo a otro. Pensado para cuando un trabajador
// cambia de cargo: se clona la plantilla y luego se ajusta, sin perder la original.
export async function duplicateTemplate(fromPosition: string, toPosition: string) {
  await requireAdmin()

  const parsed = z.object({ fromPosition: positionSchema, toPosition: positionSchema })
    .safeParse({ fromPosition, toPosition })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  if (parsed.data.fromPosition === parsed.data.toPosition) {
    throw new Error('El cargo de destino debe ser distinto al de origen')
  }

  const yaExiste = await prisma.checklistTemplate.findFirst({
    where: { position: parsed.data.toPosition },
    select: { id: true },
  })
  if (yaExiste) throw new Error(`El cargo "${parsed.data.toPosition}" ya tiene plantilla`)

  const origen = await prisma.checklistTemplate.findMany({
    where: { position: parsed.data.fromPosition },
    orderBy: { order: 'asc' },
    select: { taskName: true, order: true, isActive: true },
  })
  if (origen.length === 0) throw new Error('El cargo de origen no tiene tareas')

  await prisma.checklistTemplate.createMany({
    data: origen.map((t) => ({
      position: parsed.data.toPosition,
      taskName: t.taskName,
      order: t.order,
      isActive: t.isActive,
    })),
  })
  revalidatePlantillas()
}

// Historial de un trabajador. El ADMIN ve cualquiera; el EMPLOYEE sólo el suyo.
export async function getEmployeeReviews(employeeId: string) {
  const session = await auth()
  const user = session?.user as any
  if (!user) throw new Error('No autorizado')

  const esAdmin = user.role === 'ADMIN'
  const esDueño = user.employeeId === employeeId
  if (!esAdmin && !esDueño) throw new Error('No autorizado')

  return prisma.performanceReview.findMany({
    where: { employeeId },
    orderBy: { period: 'desc' },
    include: {
      reviewedBy: { select: { name: true } },
    },
  })
}
