import { prisma } from '@/lib/db'
import { formatCOP } from '@/lib/utils'
import { HeartPulse } from 'lucide-react'
import { NuevoAporteForm } from './NuevoAporteForm'
import { AporteActions } from './AporteActions'

export default async function AportesPage() {
  const [aportes, employees] = await Promise.all([
    prisma.socialContribution.findMany({
      orderBy: { createdAt: 'desc' },
      include: { employee: true },
    }),
    prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { firstName: 'asc' },
    }),
  ])

  const totalPagado  = aportes.filter(a => a.status === 'PAID').reduce((s, a) => s + a.total, 0)
  const totalPend    = aportes.filter(a => a.status === 'PENDING').reduce((s, a) => s + a.total, 0)

  const monthLabel = (period: string) => {
    const [y, m] = period.split('-')
    if (!y || !m) return period
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('es-CO', { month: 'long', year: 'numeric' })
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
            Star Shine · Polaris
          </p>
          <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Aportes Sociales
          </h1>
          <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
            Planilla mensual de seguridad social (EPS, Pensión, ARL, Caja)
          </p>
        </div>
        <NuevoAporteForm employees={employees.map(e => ({ id: e.id, firstName: e.firstName, lastName: e.lastName }))} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)', borderRadius: 16, padding: 24, color: 'white' }}>
          <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Total pagado</p>
          <p style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>{formatCOP(totalPagado)}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Pendiente de pago</p>
          <p style={{ color: '#F2421B', fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>{formatCOP(totalPend)}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Registros totales</p>
          <p style={{ color: '#0F1026', fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>{aportes.length}</p>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              {['Empleado', 'Período', 'Salud', 'Pensión', 'ARL', 'Caja', 'Mora', 'Total', 'Estado', ''].map((h, i) => (
                <th
                  key={h + i}
                  style={{
                    textAlign: i >= 2 && i <= 7 ? 'right' : i === 8 ? 'center' : 'left',
                    padding: '14px 16px',
                    fontSize: 11, fontWeight: 700,
                    color: '#A2A2A2',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {aportes.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '56px 20px' }}>
                  <HeartPulse size={32} style={{ margin: '0 auto 12px', color: '#E8E8E8' }} />
                  <p style={{ color: '#BBBBBB', fontSize: 14 }}>No hay aportes registrados</p>
                  <p style={{ color: '#D0D0D0', fontSize: 12, marginTop: 4 }}>Usa el botón "Registrar Aporte" para agregar la planilla mensual</p>
                </td>
              </tr>
            )}
            {aportes.map((a, idx) => (
              <tr key={a.id} style={{ borderBottom: idx < aportes.length - 1 ? '1px solid #F8F8F8' : 'none' }}>
                <td style={{ padding: '14px 16px' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0F1026' }}>
                    {a.employee.firstName} {a.employee.lastName}
                  </p>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#555', whiteSpace: 'nowrap' }}>
                  {monthLabel(a.period)}
                </td>
                {[a.health, a.pension, a.arl, a.caja, a.lateFee].map((v, i) => (
                  <td key={i} style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, color: v > 0 ? '#0F1026' : '#D0D0D0' }}>
                    {v > 0 ? formatCOP(v) : '—'}
                  </td>
                ))}
                <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#4429A6' }}>
                  {formatCOP(a.total)}
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '4px 12px', borderRadius: 99,
                    fontSize: 11, fontWeight: 600,
                    background: a.status === 'PAID' ? '#dcfce7' : '#fef9c3',
                    color:      a.status === 'PAID' ? '#15803d' : '#a16207',
                  }}>
                    {a.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <AporteActions id={a.id} status={a.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
