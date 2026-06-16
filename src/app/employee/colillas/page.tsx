import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { EmployeeColillasViewer } from './EmployeeColillasViewer'

export default async function ColillasPage() {
  const session = await auth()
  const user = session?.user as any
  const employeeId = user?.employeeId

  const [payPeriods, aportes] = await Promise.all([
    prisma.payPeriod.findMany({
      where: { employeeId },
      orderBy: { periodEnd: 'desc' },
    }),
    prisma.socialContribution.findMany({
      where: { employeeId },
      orderBy: { period: 'desc' },
    }),
  ])

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Polaris
        </p>
        <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
          Mis Colillas y Aportes
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
          Historial completo de pagos y seguridad social
        </p>
      </div>

      <EmployeeColillasViewer payPeriods={payPeriods as any} aportes={aportes as any} />
    </div>
  )
}
