'use client'

import { useState, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { createFactura } from '@/app/actions/facturas'

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

interface Company { id: string; name: string }

export function NuevaFacturaForm({ companies }: { companies: Company[] }) {
  const [open, setOpen]           = useState(false)
  const [base, setBase]           = useState('')
  const [iva, setIva]             = useState('')
  const [ivaAuto, setIvaAuto]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const total = (parseFloat(base) || 0) + (parseFloat(iva) || 0)

  function handleBaseChange(val: string) {
    setBase(val)
    if (ivaAuto) setIva((Math.round((parseFloat(val) || 0) * 0.19)).toString())
  }

  function toggleIva(checked: boolean) {
    setIvaAuto(checked)
    if (checked) setIva((Math.round((parseFloat(base) || 0) * 0.19)).toString())
    else setIva('')
  }

  function handleClose() {
    setOpen(false)
    setBase(''); setIva(''); setIvaAuto(false)
    formRef.current?.reset()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    await createFactura({
      companyId:   fd.get('companyId')  as string,
      period:      fd.get('period')     as string,
      baseAmount:  fd.get('baseAmount') as string,
      iva:         fd.get('iva')        as string,
      invoiceRef:  fd.get('invoiceRef') as string,
    })
    setSaving(false)
    handleClose()
  }

  const fmt = (v: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v)

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
        Nueva Factura
      </button>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15,16,38,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(15,16,38,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ color: '#0F1026', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Nueva Factura</h2>
                <p style={{ color: '#BBBBBB', fontSize: 13 }}>Factura de servicio Star Shine</p>
              </div>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#BBBBBB', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Cliente</label>
                  <select name="companyId" required style={inputStyle}>
                    <option value="">Seleccionar...</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Período</label>
                  <input type="month" name="period" required style={inputStyle} defaultValue={new Date().toISOString().slice(0,7)} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>N° Factura <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></label>
                <input type="text" name="invoiceRef" placeholder="ej: FAC-2025-001" style={inputStyle} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Valor base (COP)</label>
                <input
                  type="number"
                  name="baseAmount"
                  placeholder="0"
                  required
                  min="1"
                  step="1000"
                  value={base}
                  onChange={e => handleBaseChange(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>IVA</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: '#888' }}>
                    <input
                      type="checkbox"
                      checked={ivaAuto}
                      onChange={e => toggleIva(e.target.checked)}
                      style={{ accentColor: '#4429A6' }}
                    />
                    Auto 19%
                  </label>
                </div>
                <input
                  type="number"
                  name="iva"
                  placeholder="0"
                  min="0"
                  step="1000"
                  value={iva}
                  onChange={e => setIva(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {total > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #4429A6, #F2421B)',
                  borderRadius: 12, padding: '14px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 24,
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 600 }}>Total factura</p>
                  <p style={{ color: 'white', fontSize: 20, fontWeight: 800 }}>{fmt(total)}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={handleClose} style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #E8E8E8', background: 'white', color: '#666', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: saving ? '#C0BADF' : '#4429A6', color: 'white', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif', transition: 'background 0.15s' }}>
                  {saving ? 'Guardando...' : 'Crear Factura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
