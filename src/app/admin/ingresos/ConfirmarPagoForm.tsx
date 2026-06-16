'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { confirmClientPayment } from '@/app/actions/clientPayments'

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
  fontWeight: 700,
  color: '#A2A2A2',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 6,
} as const

interface Props {
  paymentId: string
  amountUSD: number
  description: string | null
  onClose: () => void
}

export function ConfirmarPagoForm({ paymentId, amountUSD, description, onClose }: Props) {
  const [cop, setCop] = useState('')
  const [trm, setTrm] = useState('')
  const [platform, setPlatform] = useState('WISE')
  const [saving, setSaving] = useState(false)

  function recalcCop(newTrm: string) {
    const t = parseFloat(newTrm)
    if (!isNaN(t) && t > 0) {
      setCop(Math.round(amountUSD * t).toString())
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await confirmClientPayment({
      clientPaymentId: paymentId,
      amountCOP: cop,
      exchangeRate: trm || undefined,
      platform,
      description: description || undefined,
    })
    setSaving(false)
    onClose()
  }

  const fmtUSD = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(15,16,38,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'white', borderRadius: 20,
        padding: 32, width: '100%', maxWidth: 440,
        boxShadow: '0 24px 64px rgba(15,16,38,0.18)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ color: '#0F1026', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Confirmar Recibo</h2>
            <p style={{ color: '#BBBBBB', fontSize: 13 }}>
              Kover envió <strong style={{ color: '#4429A6' }}>{fmtUSD(amountUSD)} USD</strong>
              {description && <> · {description}</>}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#BBBBBB', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Plataforma</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)} style={inputStyle}>
                <option value="WISE">WISE</option>
                <option value="BANCOLOMBIA">Bancolombia</option>
                <option value="NEQUI">Nequi</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>TRM <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></label>
              <input
                type="number"
                placeholder="ej: 4180"
                step="0.01"
                value={trm}
                onChange={e => { setTrm(e.target.value); recalcCop(e.target.value) }}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>
              Total recibido (COP)
              {trm && <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 6 }}>· auto-calculado</span>}
            </label>
            <input
              type="number"
              required
              min="1"
              placeholder="ej: 17500000"
              value={cop}
              onChange={e => setCop(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px', borderRadius: 10,
                border: '1.5px solid #E8E8E8',
                background: 'white', color: '#666',
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !cop}
              style={{
                padding: '10px 28px', borderRadius: 10, border: 'none',
                background: saving || !cop ? '#C0BADF' : '#4429A6',
                color: 'white', fontWeight: 700, fontSize: 14,
                cursor: saving || !cop ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif',
                transition: 'background 0.15s',
              }}
            >
              {saving ? 'Confirmando...' : 'Confirmar Recibo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
