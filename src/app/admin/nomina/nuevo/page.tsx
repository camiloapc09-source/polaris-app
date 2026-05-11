import { prisma } from '@/lib/db'
import { NuevoNominaForm } from './NuevoNominaForm'

export default async function NuevoNominaPage() {
  const employees = await prisma.employee.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      salary: true,
      conectividadDefault: true,
      toolsDefault: true,
      company: { select: { name: true } },
    },
  })

  const employeeOptions = employees.map(e => ({
    id: e.id,
    name: `${e.firstName} ${e.lastName}`,
    companyName: e.company.name,
    salary: e.salary,
    conectividadDefault: e.conectividadDefault,
    toolsDefault: e.toolsDefault,
  }))

  return <NuevoNominaForm employees={employeeOptions} />
}
