'use client'

import { useState } from 'react'
import { AlertCircle, ExternalLink } from 'lucide-react'
import { ConfirmarPagoForm } from './ConfirmarPagoForm'
import { formatDate } from '@/lib/utils'

interface PendingPayment {
  id: string
  amountUSD: number
  date: Date
  description: string | null
  evidenceUrl: string | null
  company: { name: string }
}

export function PagosPendientes({ payments }: { payments: PendingPayment[] }) {
  const [confirming, setConfirming] = useState<PendingPayment | null>(null)

  if (payments.length === 0) return null

  const fmtUSD = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`

  return (
    <>
      <div style={{
        background: '#FFFBEB', border: '1.5px solid #FDE68A',
        borderRadius: 16, padding: 24, marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <AlertCircle size={18} color="#a16207" />
          <p style={{ fontSize: 13, fontWeight: 700, color: '#a16207' }}>
            {payments.length} pago{payments.length > 1 ? 's' : ''} pendiente{payments.length > 1 ? 's' : ''} de confirmar
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {payments.map(p => (
            <div key={p.id} style={{
              background: 'white', borderRadius: 12, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 16,
              border: '1px solid #FDE68A',
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#0F1026' }}>{fmtUSD(p.amountUSD)}</p>
                <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  {p.company.name} · {formatDate(p.date)}
                  {p.description && <span> · {p.description}</span>}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {p.evidenceUrl && (
                  <a
                    href={p.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '7px 14px', borderRadius: 8,
                      border: '1.5px solid #E8E8E8',
                      color: '#4429A6', fontSize: 12, fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={13} />
                    Evidencia
                  </a>
                )}
                <button
                  onClick={() => setConfirming(p)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 8, border: 'none',
                    background: '#4429A6', color: 'white',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  Confirmar recibo
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {confirming && (
        <ConfirmarPagoForm
          paymentId={confirming.id}
          amountUSD={confirming.amountUSD}
          description={confirming.description}
          companyName={confirming.company.name}
          onClose={() => setConfirming(null)}
        />
      )}
    </>
  )
}
