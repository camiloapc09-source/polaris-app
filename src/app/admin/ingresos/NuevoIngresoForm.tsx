'use client'

import { useState, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { createIncome } from '@/app/actions/incomes'

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

export function NuevoIngresoForm() {
  const [open, setOpen] = useState(false)
  const [usd, setUsd] = useState('')
  const [trm, setTrm] = useState('')
  const [cop, setCop] = useState('')
  const [saving, setSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function recalcCop(newUsd: string, newTrm: string) {
    const u = parseFloat(newUsd)
    const t = parseFloat(newTrm)
    if (!isNaN(u) && !isNaN(t) && t > 0) {
      setCop(Math.round(u * t).toString())
    }
  }

  function handleClose() {
    setOpen(false)
    setUsd('')
    setTrm('')
    setCop('')
    formRef.current?.reset()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    await createIncome({
      date: fd.get('date') as string,
      amountUSD: fd.get('amountUSD') as string,
      exchangeRate: fd.get('exchangeRate') as string,
      amountCOP: fd.get('amountCOP') as string,
      platform: fd.get('platform') as string,
      description: fd.get('description') as string,
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
        Nuevo Ingreso
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(15,16,38,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div style={{
            background: 'white', borderRadius: 20,
            padding: 32, width: '100%', maxWidth: 480,
            boxShadow: '0 24px 64px rgba(15,16,38,0.18)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ color: '#0F1026', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Nuevo Ingreso</h2>
                <p style={{ color: '#BBBBBB', fontSize: 13 }}>Registrar pago recibido de cliente</p>
              </div>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#BBBBBB', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Fecha</label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Plataforma</label>
                  <select name="platform" style={inputStyle}>
                    <option value="WISE">WISE</option>
                    <option value="BANCOLOMBIA">Bancolombia</option>
                    <option value="NEQUI">Nequi</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Monto USD <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></label>
                  <input
                    type="number"
                    name="amountUSD"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={usd}
                    onChange={e => { setUsd(e.target.value); recalcCop(e.target.value, trm) }}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>TRM <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></label>
                  <input
                    type="number"
                    name="exchangeRate"
                    placeholder="ej: 4180"
                    step="0.01"
                    min="0"
                    value={trm}
                    onChange={e => { setTrm(e.target.value); recalcCop(usd, e.target.value) }}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>
                  Total COP
                  {usd && trm && <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 6 }}>· auto-calculado</span>}
                </label>
                <input
                  type="number"
                  name="amountCOP"
                  placeholder="1350000"
                  required
                  min="1"
                  value={cop}
                  onChange={e => setCop(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>Descripción <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></label>
                <input
                  type="text"
                  name="description"
                  placeholder="ej: Pago Mayo Q1 – nombre del cliente"
                  style={inputStyle}
                />
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
                  disabled={saving}
                  style={{
                    padding: '10px 28px', borderRadius: 10, border: 'none',
                    background: saving ? '#C0BADF' : '#4429A6',
                    color: 'white', fontWeight: 700, fontSize: 14,
                    cursor: saving ? 'not-allowed' : 'pointer',
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
