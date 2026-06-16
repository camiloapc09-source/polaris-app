import { prisma } from '@/lib/db'
import { formatCOP } from '@/lib/utils'
import { Receipt } from 'lucide-react'
import { NuevaFacturaForm } from './NuevaFacturaForm'
import { FacturaActions } from './FacturaActions'

export default async function FacturasPage() {
  const [facturas, companies] = await Promise.all([
    prisma.serviceInvoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: { company: true },
    }),
    prisma.company.findMany({ orderBy: { name: 'asc' } }),
  ])

  const totalPagado = facturas.filter(f => f.status === 'PAID').reduce((s, f) => s + f.total, 0)
  const totalPend   = facturas.filter(f => f.status !== 'PAID').reduce((s, f) => s + f.total, 0)

  const monthLabel = (period: string) => {
    const [y, m] = period.split('-')
    const yn = parseInt(y), mn = parseInt(m)
    if (isNaN(yn) || isNaN(mn) || mn < 1 || mn > 12) return period
    return new Date(yn, mn - 1).toLocaleString('es-CO', { month: 'long', year: 'numeric' })
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
            Facturas de Servicio
          </h1>
          <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
            Facturación mensual a clientes por servicios EOR
          </p>
        </div>
        <NuevaFacturaForm companies={companies.map(c => ({ id: c.id, name: c.name }))} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)', borderRadius: 16, padding: 24, color: 'white' }}>
          <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Total facturado</p>
          <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', wordBreak: 'break-all' }}>
            {formatCOP(totalPagado + totalPend)}
          </p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Cobrado</p>
          <p style={{ color: '#15803d', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{formatCOP(totalPagado)}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Por cobrar</p>
          <p style={{ color: '#F2421B', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{formatCOP(totalPend)}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Total facturas</p>
          <p style={{ color: '#0F1026', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{facturas.length}</p>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              {['Cliente', 'Período', 'N° Factura', 'Base', 'IVA', 'Total', 'Estado', ''].map((h, i) => (
                <th
                  key={h + i}
                  style={{
                    textAlign: i >= 3 && i <= 5 ? 'right' : i === 6 ? 'center' : 'left',
                    padding: '14px 16px',
                    fontSize: 11, fontWeight: 700,
                    color: '#A2A2A2',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {facturas.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '56px 20px' }}>
                  <Receipt size={32} style={{ margin: '0 auto 12px', color: '#E8E8E8' }} />
                  <p style={{ color: '#BBBBBB', fontSize: 14 }}>No hay facturas registradas</p>
                  <p style={{ color: '#D0D0D0', fontSize: 12, marginTop: 4 }}>Crea la primera factura con el botón "Nueva Factura"</p>
                </td>
              </tr>
            )}
            {facturas.map((f, idx) => (
              <tr key={f.id} style={{ borderBottom: idx < facturas.length - 1 ? '1px solid #F8F8F8' : 'none' }}>
                <td style={{ padding: '14px 16px' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0F1026' }}>{f.company.name}</p>
                  <p style={{ fontSize: 11, color: '#A2A2A2' }}>{f.company.country}</p>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#555', whiteSpace: 'nowrap' }}>
                  {monthLabel(f.period)}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13 }}>
                  {f.invoiceRef
                    ? <span style={{ background: '#F0EDFF', color: '#4429A6', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>{f.invoiceRef}</span>
                    : <span style={{ color: '#D0D0D0' }}>—</span>
                  }
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, color: '#555' }}>
                  {formatCOP(f.baseAmount)}
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, color: f.iva > 0 ? '#555' : '#D0D0D0' }}>
                  {f.iva > 0 ? formatCOP(f.iva) : '—'}
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#4429A6' }}>
                  {formatCOP(f.total)}
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '4px 12px', borderRadius: 99,
                    fontSize: 11, fontWeight: 600,
                    background: f.status === 'PAID' ? '#dcfce7' : f.status === 'SENT' ? '#dbeafe' : '#fef9c3',
                    color:      f.status === 'PAID' ? '#15803d' : f.status === 'SENT' ? '#1d4ed8' : '#a16207',
                  }}>
                    {f.status === 'PAID' ? 'Cobrada' : f.status === 'SENT' ? 'Enviada' : 'Pendiente'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <FacturaActions
                    id={f.id}
                    status={f.status}
                    sentEvidenceUrl={f.sentEvidenceUrl}
                    sentAmountUSD={f.sentAmountUSD}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
