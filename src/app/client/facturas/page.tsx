import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCOP } from '@/lib/utils'
import { Receipt, FileText, CheckCircle, Clock } from 'lucide-react'
import { MarcarEnviadoForm } from './MarcarEnviadoForm'

export default async function ClientFacturasPage() {
  const session = await auth()
  const user = session?.user as any
  const companyId = user?.companyId

  const facturas = await prisma.serviceInvoice.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
  })

  const totalPaid    = facturas.filter(f => f.status === 'PAID').reduce((s, f) => s + f.total, 0)
  const totalPending = facturas.filter(f => f.status !== 'PAID').reduce((s, f) => s + f.total, 0)
  const totalPaidUSD    = facturas.filter(f => f.status === 'PAID').reduce((s, f) => s + (f.sentAmountUSD ?? 0), 0)
  const totalPendingUSD = facturas.filter(f => f.status !== 'PAID').reduce((s, f) => s + (f.sentAmountUSD ?? 0), 0)
  const fmtUSD = (n: number) => n > 0 ? `≈ $${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD` : ''

  const monthLabel = (period: string) => {
    const [y, m] = period.split('-')
    const yn = parseInt(y), mn = parseInt(m)
    if (isNaN(yn) || isNaN(mn) || mn < 1 || mn > 12) return period
    return new Date(yn, mn - 1).toLocaleString('es-CO', { month: 'long', year: 'numeric' })
  }

  function statusBadge(status: string) {
    if (status === 'PAID')    return { bg: '#dcfce7', color: '#15803d', label: 'Pagada' }
    if (status === 'SENT')    return { bg: '#dbeafe', color: '#1d4ed8', label: 'Enviada · pendiente confirmación' }
    return { bg: '#fef9c3', color: '#a16207', label: 'Pendiente de pago' }
  }

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Kover Solutions · Polaris
        </p>
        <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
          Facturas de Servicio
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
          Facturación mensual de Star Shine por servicios EOR
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)', borderRadius: 16, padding: 24, color: 'white' }}>
          <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Total facturado</p>
          <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{formatCOP(totalPaid + totalPending)}</p>
          {fmtUSD(totalPaidUSD + totalPendingUSD) && (
            <p style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>{fmtUSD(totalPaidUSD + totalPendingUSD)}</p>
          )}
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Pagado</p>
          <p style={{ color: '#15803d', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{formatCOP(totalPaid)}</p>
          {fmtUSD(totalPaidUSD) && (
            <p style={{ fontSize: 12, color: '#15803d', opacity: 0.7, marginTop: 6 }}>{fmtUSD(totalPaidUSD)}</p>
          )}
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Pendiente</p>
          <p style={{ color: '#F2421B', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{formatCOP(totalPending)}</p>
          {fmtUSD(totalPendingUSD) && (
            <p style={{ fontSize: 12, color: '#F2421B', opacity: 0.7, marginTop: 6 }}>{fmtUSD(totalPendingUSD)}</p>
          )}
        </div>
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {facturas.map(f => {
          const badge = statusBadge(f.status)
          return (
            <div key={f.id} style={{
              background: 'white', borderRadius: 16, padding: '20px 24px',
              border: '1px solid #EFEFEF',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F0EDFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Receipt size={20} color="#4429A6" />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0F1026', textTransform: 'capitalize' }}>
                        {monthLabel(f.period)}
                      </p>
                      {f.invoiceNumber && (
                        <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                          Cuenta de Cobro N° {f.invoiceNumber}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 10, color: '#A2A2A2', marginBottom: 2 }}>Total</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: '#4429A6' }}>{formatCOP(f.total)}</p>
                      </div>
                      <span style={{
                        padding: '5px 14px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                        background: badge.bg, color: badge.color,
                        whiteSpace: 'nowrap',
                      }}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                    <a
                      href={`/admin/facturas/${f.id}/pdf`}
                      target="_blank"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#F0EDFF', color: '#4429A6',
                        borderRadius: 8, padding: '7px 14px',
                        fontSize: 12, fontWeight: 600, textDecoration: 'none',
                      }}
                    >
                      <FileText size={13} />
                      Descargar PDF
                    </a>

                    {f.status === 'PENDING' && (
                      <MarcarEnviadoForm facturaId={f.id} total={f.total} />
                    )}

                    {f.status === 'SENT' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#1d4ed8' }}>
                        <Clock size={13} />
                        <span>Pago reportado — esperando confirmación de Star Shine</span>
                      </div>
                    )}

                    {f.status === 'PAID' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#15803d' }}>
                        <CheckCircle size={13} />
                        <span>
                          Pago confirmado
                          {f.paidAt ? ` · ${new Date(f.paidAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                          {f.sentAmountUSD ? ` · ≈ USD ${f.sentAmountUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })} enviados` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {facturas.length === 0 && (
          <div style={{ background: 'white', borderRadius: 16, padding: '56px 20px', border: '1px solid #EFEFEF', textAlign: 'center' }}>
            <Receipt size={36} style={{ margin: '0 auto 12px', color: '#E8E8E8' }} />
            <p style={{ color: '#BBBBBB', fontSize: 14 }}>No hay facturas registradas aún</p>
          </div>
        )}
      </div>
    </div>
  )
}
