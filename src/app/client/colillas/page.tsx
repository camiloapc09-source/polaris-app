import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ColillasViewer } from './ColillasViewer'

export default async function ClientColillasPage() {
  const session = await auth()
  const user = session?.user as any
  const companyId = user?.companyId

  const employees = await prisma.employee.findMany({
    where: { companyId, status: 'ACTIVE' },
    include: {
      payPeriods: { orderBy: { periodEnd: 'desc' } },
      socialContributions: { orderBy: { period: 'desc' } },
    },
    orderBy: { firstName: 'asc' },
  })

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Kover Solutions · Polaris
        </p>
        <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
          Colillas y Aportes
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
          Historial de pagos y seguridad social de tus empleados en Colombia
        </p>
      </div>

      <ColillasViewer employees={employees as any} />
    </div>
  )
}
