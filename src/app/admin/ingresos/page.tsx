import { prisma } from '@/lib/db'
import { formatCOP, formatDate } from '@/lib/utils'
import { NuevoIngresoForm } from './NuevoIngresoForm'
import { PagosPendientes } from './PagosPendientes'

export default async function IngresosPage() {
  const [incomes, pendingPayments] = await Promise.all([
    prisma.income.findMany({
      orderBy: { date: 'desc' },
      include: { company: true },
    }),
    prisma.clientPayment.findMany({
      where: { status: 'PENDING' },
      orderBy: { date: 'desc' },
      include: { company: true },
    }),
  ])

  const totalCOP = incomes.reduce((s, i) => s + i.amountCOP, 0)
  const totalUSD = incomes.reduce((s, i) => s + (i.amountUSD || 0), 0)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
            Star Shine · Polaris
          </p>
          <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Ingresos
          </h1>
          <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
            Pagos recibidos de clientes vía WISE
          </p>
        </div>
        <NuevoIngresoForm />
      </div>

      <PagosPendientes payments={pendingPayments} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{
          background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)',
          borderRadius: 16, padding: 24, color: 'white',
        }}>
          <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Total recibido (COP)</p>
          <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{formatCOP(totalCOP)}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Total recibido (USD)</p>
          <p style={{ color: '#0F1026', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>
            ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Pagos registrados</p>
          <p style={{ color: '#0F1026', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{incomes.length}</p>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              {['Fecha', 'Descripción', 'Plataforma', 'USD', 'TRM', 'Total COP'].map((h, i) => (
                <th
                  key={h}
                  style={{
                    textAlign: i >= 3 ? 'right' : 'left',
                    padding: '14px 20px',
                    fontSize: 11, fontWeight: 700,
                    color: '#A2A2A2',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {incomes.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '56px 20px', color: '#BBBBBB', fontSize: 14 }}>
                  No hay ingresos registrados aún
                </td>
              </tr>
            )}
            {incomes.map((income, idx) => (
              <tr
                key={income.id}
                style={{ borderBottom: idx < incomes.length - 1 ? '1px solid #F8F8F8' : 'none' }}
              >
                <td style={{ padding: '16px 20px', fontSize: 13, color: '#0F1026', fontWeight: 500 }}>
                  {formatDate(income.date)}
                </td>
                <td style={{ padding: '16px 20px', fontSize: 13, color: '#888' }}>
                  {income.description || <span style={{ color: '#D0D0D0' }}>—</span>}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    display: 'inline-block',
                    background: '#F0EDFF', color: '#4429A6',
                    fontSize: 11, fontWeight: 700,
                    padding: '3px 10px', borderRadius: 99,
                  }}>
                    {income.platform}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right', fontSize: 13, color: '#0F1026' }}>
                  {income.amountUSD
                    ? `$${income.amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : <span style={{ color: '#D0D0D0' }}>—</span>
                  }
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right', fontSize: 13, color: '#888' }}>
                  {income.exchangeRate
                    ? income.exchangeRate.toLocaleString('es-CO')
                    : <span style={{ color: '#D0D0D0' }}>—</span>
                  }
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#4429A6' }}>
                  {formatCOP(income.amountCOP)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
