import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCOP, formatDate } from '@/lib/utils'

export default async function ClientEmpleadosPage() {
  const session = await auth()
  const user = session?.user as any
  const companyId = user?.companyId

  // El encabezado debe mostrar la empresa del usuario, no un nombre fijo
  const company = companyId
    ? await prisma.company.findUnique({ where: { id: companyId }, select: { name: true } })
    : null
  const companyName = company?.name ?? 'Polaris'

  const employees = await prisma.employee.findMany({
    where: { companyId },
    include: {
      payPeriods: { orderBy: { periodEnd: 'desc' }, take: 1 },
    },
    orderBy: { firstName: 'asc' },
  })

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          {companyName} · Polaris
        </p>
        <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
          Tus Empleados
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
          Colaboradores contratados a través de Star Shine en Colombia
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {employees.map(emp => {
          const lastPay = emp.payPeriods[0]
          const initial = emp.firstName.charAt(0) + emp.lastName.charAt(0)
          return (
            <div key={emp.id} style={{
              background: 'white', borderRadius: 16, padding: 24,
              border: '1px solid #EFEFEF',
              display: 'flex', alignItems: 'center', gap: 20,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #4429A6, #F2421B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>{initial}</span>
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#0F1026' }}>
                  {emp.firstName} {emp.lastName}
                </p>
                <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
                  {emp.position} · Desde {formatDate(emp.startDate)}
                </p>
                {emp.email && (
                  <p style={{ fontSize: 12, color: '#BBBBBB', marginTop: 2 }}>{emp.email}</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: '#A2A2A2', marginBottom: 2 }}>Salario quincenal</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0F1026' }}>{formatCOP(emp.salary)}</p>
                </div>
                {lastPay && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 11, color: '#A2A2A2', marginBottom: 2 }}>Último pago</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#4429A6' }}>{formatCOP(lastPay.netPay)}</p>
                    <p style={{ fontSize: 11, color: '#BBBBBB' }}>{lastPay.periodLabel}</p>
                  </div>
                )}
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '5px 14px', borderRadius: 99,
                  fontSize: 12, fontWeight: 600,
                  background: emp.status === 'ACTIVE' ? '#DCFCE7' : '#F3F4F6',
                  color: emp.status === 'ACTIVE' ? '#15803D' : '#6B7280',
                }}>
                  {emp.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          )
        })}

        {employees.length === 0 && (
          <div style={{
            background: 'white', borderRadius: 16, padding: '56px 20px',
            border: '1px solid #EFEFEF', textAlign: 'center',
          }}>
            <p style={{ color: '#BBBBBB', fontSize: 14 }}>No hay empleados registrados</p>
          </div>
        )}
      </div>
    </div>
  )
}
