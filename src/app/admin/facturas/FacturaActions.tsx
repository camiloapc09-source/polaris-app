'use client'

import { useState } from 'react'
import { FileText, Trash2, CheckCircle, ExternalLink, DollarSign } from 'lucide-react'
import { confirmFacturaPaid, deleteFactura } from '@/app/actions/facturas'

const inputStyle = {
  width: '100%',
  background: '#F4F4F7',
  border: '1.5px solid transparent',
  borderRadius: 10,
  padding: '11px 14px',
  fontSize: 14,
  color: '#0F1026',
  outline: 'none',
  fontFamily: 'Poppins, sans-serif',
} as const

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700 as const,
  color: '#A2A2A2',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  marginBottom: 6,
}

interface Props {
  id: string
  status: string
  sentEvidenceUrl?: string | null
  sentAmountUSD?: number | null
  companyName: string
}

export function FacturaActions({ id, status, sentEvidenceUrl, sentAmountUSD, companyName }: Props) {
  const [loading, setLoading]       = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [copAmount, setCopAmount]   = useState('')

  const fmtUSD = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  async function handleConfirmPaid() {
    if (!copAmount) return
    setLoading(true)
    await confirmFacturaPaid(id, parseFloat(copAmount))
    setLoading(false)
    setConfirmOpen(false)
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar esta factura? Esta acción no se puede deshacer.')) return
    setLoading(true)
    await deleteFactura(id)
    setLoading(false)
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <a
          href={`/admin/facturas/${id}/pdf`}
          target="_blank"
          style={{
            background: '#F0EDFF', color: '#4429A6',
            borderRadius: 8, padding: '6px 10px',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 600, textDecoration: 'none',
          }}
        >
          <FileText size={13} />
          PDF
        </a>

        {status === 'SENT' && (
          <>
            <button
              onClick={() => setConfirmOpen(true)}
              style={{
                background: '#dcfce7', color: '#15803d',
                border: 'none', borderRadius: 8, padding: '6px 10px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 600, fontFamily: 'Poppins, sans-serif',
              }}
            >
              <CheckCircle size={13} />
              Confirmar
            </button>
            {sentEvidenceUrl && (
              <a
                href={sentEvidenceUrl}
                target="_blank"
                style={{
                  background: '#fef3c7', color: '#d97706',
                  borderRadius: 8, padding: '6px 10px',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 12, fontWeight: 600, textDecoration: 'none',
                }}
              >
                <ExternalLink size={13} />
                Evidencia
              </a>
            )}
          </>
        )}

        {status === 'PENDING' && (
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{
              background: '#fee2e2', color: '#b91c1c',
              border: 'none', borderRadius: 8, padding: '6px 10px',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              opacity: loading ? 0.5 : 1,
            }}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {confirmOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15,16,38,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmOpen(false) }}
        >
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(15,16,38,0.18)' }}>
            <h2 style={{ color: '#0F1026', fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Confirmar Pago Recibido</h2>
            <p style={{ color: '#BBBBBB', fontSize: 13, marginBottom: 20 }}>
              {companyName} reportó envío de{' '}
              <strong style={{ color: '#0F1026' }}>
                {sentAmountUSD ? fmtUSD(sentAmountUSD) : 'monto no registrado'}
              </strong>.
              Ingresa el monto que recibiste en COP.
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Monto recibido (COP)</label>
              <input
                type="number"
                placeholder="ej: 1681955"
                min="1"
                step="any"
                value={copAmount}
                onChange={e => setCopAmount(e.target.value)}
                style={inputStyle}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #E8E8E8', background: 'white', color: '#666', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPaid}
                disabled={loading || !copAmount}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: loading || !copAmount ? '#C0BADF' : '#4429A6',
                  color: 'white', fontWeight: 700, fontSize: 14,
                  cursor: loading || !copAmount ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <DollarSign size={14} />
                {loading ? 'Guardando...' : 'Confirmar recibo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
