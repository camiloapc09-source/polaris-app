'use client'

import { useState, useRef } from 'react'
import { Plus, X, Upload, Loader2 } from 'lucide-react'
import { createClientPayment } from '@/app/actions/clientPayments'

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

interface InvoiceOption {
  id: string
  invoiceNumber: string | null
  period: string
  total: number
  sentAmountUSD: number | null
  status: string
}

export function NuevoPagoForm({ invoices = [] }: { invoices?: InvoiceOption[] }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [evidenceFileName, setEvidenceFileName] = useState('')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('')
  const [amount, setAmount] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleInvoiceSelect(id: string) {
    setSelectedInvoiceId(id)
    const inv = invoices.find(i => i.id === id)
    if (inv?.sentAmountUSD) setAmount(String(inv.sentAmountUSD))
    else setAmount('')
  }

  function handleClose() {
    setOpen(false)
    setEvidenceUrl('')
    setEvidenceFileName('')
    setSelectedInvoiceId('')
    setAmount('')
    formRef.current?.reset()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()
    setEvidenceUrl(json.url)
    setEvidenceFileName(file.name)
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const inv = invoices.find(i => i.id === selectedInvoiceId)
    const desc = inv
      ? `CC-${inv.invoiceNumber} · ${inv.period}`
      : (fd.get('description') as string) || undefined
    await createClientPayment({
      amountUSD: fd.get('amountUSD') as string,
      date: fd.get('date') as string,
      description: desc,
      evidenceUrl: evidenceUrl || undefined,
    })
    setSaving(false)
    handleClose()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#4429A6', color: 'white',
          fontWeight: 600, fontSize: 14,
          padding: '10px 20px', borderRadius: 12,
          border: 'none', cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        <Plus size={16} />
        Registrar Envío
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(15,16,38,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div style={{
            background: 'white', borderRadius: 20,
            padding: 32, width: '100%', maxWidth: 480,
            boxShadow: '0 24px 64px rgba(15,16,38,0.18)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ color: '#0F1026', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Registrar Envío</h2>
                <p style={{ color: '#BBBBBB', fontSize: 13 }}>Documenta el pago que enviaste a Star Shine</p>
              </div>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#BBBBBB', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit}>
              {invoices.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Factura / Cuenta de cobro</label>
                  <select
                    style={inputStyle}
                    value={selectedInvoiceId}
                    onChange={e => handleInvoiceSelect(e.target.value)}
                  >
                    <option value="">Seleccionar factura (opcional)</option>
                    {invoices.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber ? `CC-${inv.invoiceNumber}` : 'Sin número'} · {inv.period}
                        {inv.sentAmountUSD ? ` · $${inv.sentAmountUSD} USD` : ''}
                        {inv.status === 'PAID' ? ' ✓' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Fecha del envío</label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Monto enviado (USD)</label>
                  <input
                    type="number"
                    name="amountUSD"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {!selectedInvoiceId && (
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Referencia / Nota <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></label>
                  <input
                    type="text"
                    name="description"
                    placeholder="ej: Pago Mayo Q1 Justine"
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Upload evidencia */}
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Evidencia del envío <span style={{ fontWeight: 400, textTransform: 'none' }}>(captura / comprobante)</span></label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                {evidenceUrl ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', background: '#F0FFF4',
                    borderRadius: 10, border: '1.5px solid #86efac',
                  }}>
                    <span style={{ fontSize: 13, color: '#15803d', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      ✓ {evidenceFileName}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setEvidenceUrl(''); setEvidenceFileName('') }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      width: '100%', padding: '14px',
                      borderRadius: 10, border: '2px dashed #E8E8E8',
                      background: 'white', cursor: uploading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      color: '#BBBBBB', fontSize: 13, fontWeight: 500,
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {uploading ? 'Subiendo...' : 'Subir captura o PDF'}
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleClose}
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
                  disabled={saving || uploading}
                  style={{
                    padding: '10px 28px', borderRadius: 10, border: 'none',
                    background: saving || uploading ? '#C0BADF' : '#4429A6',
                    color: 'white', fontWeight: 700, fontSize: 14,
                    cursor: saving || uploading ? 'not-allowed' : 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    transition: 'background 0.15s',
                  }}
                >
                  {saving ? 'Guardando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
