import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { DollarSign, ExternalLink } from 'lucide-react'
import { NuevoPagoForm } from './NuevoPagoForm'

export default async function PagosPage() {
  const session = await auth()
  const user = session?.user as any
  const companyId = user?.companyId

  const [payments, invoices] = await Promise.all([
    prisma.clientPayment.findMany({
      where: { companyId },
      orderBy: { date: 'desc' },
    }),
    prisma.serviceInvoice.findMany({
      where: { companyId },
      orderBy: { invoiceDate: 'desc' },
      select: { id: true, invoiceNumber: true, period: true, total: true, sentAmountUSD: true, status: true },
    }),
  ])

  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amountUSD, 0)
  const totalConfirmed = payments.filter(p => p.status === 'CONFIRMED').reduce((s, p) => s + p.amountUSD, 0)

  const fmtUSD = (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
            Kover Solutions · Polaris
          </p>
          <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Pagos Enviados
          </h1>
          <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
            Registra los envíos a Star Shine y sube la evidencia
          </p>
        </div>
        <NuevoPagoForm invoices={invoices} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)', borderRadius: 16, padding: 24, color: 'white' }}>
          <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Total confirmado</p>
          <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{fmtUSD(totalConfirmed)} USD</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Pendiente confirmación</p>
          <p style={{ color: '#F2421B', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{fmtUSD(totalPending)} USD</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Envíos registrados</p>
          <p style={{ color: '#0F1026', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{payments.length}</p>
        </div>
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {payments.map(p => (
          <div key={p.id} style={{
            background: 'white', borderRadius: 16, padding: 24,
            border: '1px solid #EFEFEF',
            display: 'flex', alignItems: 'center', gap: 20,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: p.status === 'CONFIRMED' ? '#dcfce7' : '#fef9c3',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <DollarSign size={22} color={p.status === 'CONFIRMED' ? '#15803d' : '#a16207'} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#0F1026', letterSpacing: '-0.01em' }}>
                  {fmtUSD(p.amountUSD)} USD
                </p>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '3px 10px', borderRadius: 99,
                  fontSize: 11, fontWeight: 600,
                  background: p.status === 'CONFIRMED' ? '#dcfce7' : '#fef9c3',
                  color: p.status === 'CONFIRMED' ? '#15803d' : '#a16207',
                }}>
                  {p.status === 'CONFIRMED' ? 'Confirmado' : 'Pendiente'}
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#888' }}>
                {formatDate(p.date)}
                {p.description && <span> · {p.description}</span>}
              </p>
            </div>

            {p.evidenceUrl && (
              <a
                href={p.evidenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 10,
                  border: '1.5px solid #E8E8E8',
                  color: '#4429A6', fontSize: 13, fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={14} />
                Ver evidencia
              </a>
            )}
          </div>
        ))}

        {payments.length === 0 && (
          <div style={{
            background: 'white', borderRadius: 16, padding: '56px 20px',
            border: '1px solid #EFEFEF', textAlign: 'center',
          }}>
            <DollarSign size={40} style={{ margin: '0 auto 12px', color: '#E8E8E8' }} />
            <p style={{ color: '#BBBBBB', fontSize: 14 }}>No hay pagos registrados aún</p>
            <p style={{ color: '#D0D0D0', fontSize: 12, marginTop: 4 }}>
              Usa el botón "Registrar Envío" para añadir tu primer pago
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
