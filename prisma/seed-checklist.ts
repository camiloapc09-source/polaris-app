import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

// Cargar .env manualmente (este script se corre con ts-node directo, no via prisma CLI)
const envPath = path.resolve(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) {
      let v = m[2].trim()
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
      process.env[m[1]] = v
    }
  }
}

const prisma = new PrismaClient()

// Cargo real de las asistentes. Debe coincidir EXACTAMENTE con Employee.position
// para que createPerformanceReview encuentre la plantilla.
const POSITION = 'Asistente Administrativa y Financiera'

// Funciones tomadas del contrato laboral. Editables después desde /admin/plantillas.
const TASKS = [
  'Documentación física y digital organizada y actualizada',
  'Registro de ingresos, egresos y pagos al día',
  'Soporte a procesos contables entregado a tiempo',
  'SOPs y procesos internos documentados',
  'Reportes administrativos entregados según cronograma',
  'Comunicación oportuna con el jefe inmediato',
]

async function main() {
  // Idempotente: no duplica si el script se corre dos veces.
  const existentes = await prisma.checklistTemplate.findMany({
    where: { position: POSITION },
    select: { taskName: true },
  })
  const yaEstan = new Set(existentes.map((t) => t.taskName))

  let creadas = 0
  for (const [i, taskName] of TASKS.entries()) {
    if (yaEstan.has(taskName)) continue
    await prisma.checklistTemplate.create({
      data: { position: POSITION, taskName, order: i + 1, isActive: true },
    })
    creadas++
  }

  console.log(`Plantilla "${POSITION}": ${creadas} tarea(s) creada(s), ${yaEstan.size} ya existían.`)

  // Diagnóstico: ¿qué cargos hay realmente en la BD? La plantilla solo aplica
  // si Employee.position coincide exactamente con POSITION.
  const empleados = await prisma.employee.findMany({
    select: { firstName: true, lastName: true, position: true, status: true },
  })
  console.log('\nCargos actuales en Employee:')
  for (const e of empleados) {
    const match = e.position === POSITION ? '✓ coincide' : '✗ NO coincide con la plantilla'
    console.log(`  - ${e.firstName} ${e.lastName} (${e.status}): "${e.position}" → ${match}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
