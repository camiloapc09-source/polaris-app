'use client'

import { useState } from 'react'
import { Send, X, Upload } from 'lucide-react'
import { markFacturaSent } from '@/app/actions/facturas'

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
  facturaId: string
  total: number
}

export function MarcarEnviadoForm({ facturaId, total }: Props) {
  const [open, setOpen]         = useState(false)
  const [amountUSD, setAmount]  = useState('')
  const [file, setFile]         = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]     = useState(false)

  const fmtCOP = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

  function handleClose() {
    setOpen(false)
    setAmount('')
    setFile(null)
    setSaving(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amountUSD) return
    setSaving(true)

    let evidenceUrl = ''
    if (file) {
      setUploading(true)
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      evidenceUrl = data.url ?? ''
      setUploading(false)
    }

    await markFacturaSent(facturaId, parseFloat(amountUSD), evidenceUrl)
    setSaving(false)
    handleClose()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#4429A6', color: 'white',
          border: 'none', borderRadius: 8,
          padding: '7px 14px', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
        }}
      >
        <Send size={13} />
        Marcar enviado
      </button>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15,16,38,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(15,16,38,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ color: '#0F1026', fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Confirmar envío de pago</h2>
                <p style={{ color: '#BBBBBB', fontSize: 13 }}>
                  Factura por <strong style={{ color: '#4429A6' }}>{fmtCOP(total)}</strong>
                </p>
              </div>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#BBBBBB', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Monto enviado (USD)</label>
                <input
                  type="number"
                  placeholder="ej: 420.50"
                  min="0.01"
                  step="0.01"
                  required
                  value={amountUSD}
                  onChange={e => setAmount(e.target.value)}
                  style={inputStyle}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Evidencia de pago <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10 }}>(captura de pantalla / PDF)</span></label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#F4F4F7', borderRadius: 10, padding: '11px 14px',
                  cursor: 'pointer', fontSize: 13, color: file ? '#0F1026' : '#A2A2A2',
                }}>
                  <Upload size={16} color="#A2A2A2" />
                  {file ? file.name : 'Seleccionar archivo...'}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    onChange={e => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #E8E8E8', background: 'white', color: '#666', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  style={{
                    padding: '10px 24px', borderRadius: 10, border: 'none',
                    background: saving || uploading ? '#C0BADF' : '#4429A6',
                    color: 'white', fontWeight: 700, fontSize: 14,
                    cursor: saving || uploading ? 'not-allowed' : 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Send size={14} />
                  {uploading ? 'Subiendo...' : saving ? 'Guardando...' : 'Confirmar envío'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
