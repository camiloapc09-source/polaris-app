'use client'

import { useState, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { createAporte } from '@/app/actions/aportes'

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

interface Employee { id: string; firstName: string; lastName: string }

export function NuevoAporteForm({ employees }: { employees: Employee[] }) {
  const [open, setOpen] = useState(false)
  const [health, setHealth]   = useState('')
  const [pension, setPension] = useState('')
  const [arl, setArl]         = useState('')
  const [caja, setCaja]       = useState('')
  const [lateFee, setLateFee]       = useState('')
  const [voucherUrl, setVoucherUrl] = useState('')
  const [saving, setSaving]         = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const total = (
    (parseFloat(health)  || 0) +
    (parseFloat(pension) || 0) +
    (parseFloat(arl)     || 0) +
    (parseFloat(caja)    || 0) +
    (parseFloat(lateFee) || 0)
  )

  function handleClose() {
    setOpen(false)
    setHealth(''); setPension(''); setArl(''); setCaja(''); setLateFee(''); setVoucherUrl('')
    formRef.current?.reset()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    await createAporte({
      employeeId: fd.get('employeeId') as string,
      period:     fd.get('period')     as string,
      health:     fd.get('health')     as string,
      pension:    fd.get('pension')    as string,
      arl:        fd.get('arl')        as string,
      caja:       fd.get('caja')       as string,
      lateFee:    fd.get('lateFee')    as string,
      voucherUrl: (fd.get('voucherUrl') as string) || undefined,
    })
    setSaving(false)
    handleClose()
  }

  const formatN = (v: string) => v
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(parseFloat(v))
    : ''

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
        Registrar Aporte
      </button>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15,16,38,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(15,16,38,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ color: '#0F1026', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Registrar Aporte</h2>
                <p style={{ color: '#BBBBBB', fontSize: 13 }}>Planilla mensual de seguridad social</p>
              </div>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#BBBBBB', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Empleado</label>
                  <select name="employeeId" required style={inputStyle}>
                    <option value="">Seleccionar...</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Período</label>
                  <input type="month" name="period" required style={inputStyle} defaultValue={new Date().toISOString().slice(0,7)} />
                </div>
              </div>

              <div style={{ background: '#F8F8FC', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <p style={{ ...labelStyle, marginBottom: 12 }}>Desglose de aportes</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { name: 'health',  label: 'EPS / Salud',  val: health,  set: setHealth  },
                    { name: 'pension', label: 'Pensión',      val: pension, set: setPension },
                    { name: 'arl',     label: 'ARL',          val: arl,     set: setArl     },
                    { name: 'caja',    label: 'Caja de Comp.', val: caja,   set: setCaja    },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={labelStyle}>{f.label}</label>
                      <input
                        type="number"
                        name={f.name}
                        placeholder="0"
                        min="0"
                        step="100"
                        value={f.val}
                        onChange={e => f.set(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Intereses / Mora <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></label>
                <input
                  type="number"
                  name="lateFee"
                  placeholder="0"
                  min="0"
                  step="100"
                  value={lateFee}
                  onChange={e => setLateFee(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Comprobante de pago <span style={{ fontWeight: 400, textTransform: 'none' }}>(link Google Drive, opcional)</span></label>
                <input
                  type="url"
                  name="voucherUrl"
                  placeholder="https://drive.google.com/..."
                  value={voucherUrl}
                  onChange={e => setVoucherUrl(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {total > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #4429A6, #7F71D9)',
                  borderRadius: 12, padding: '14px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 24,
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 600 }}>Total planilla</p>
                  <p style={{ color: 'white', fontSize: 20, fontWeight: 800 }}>
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(total)}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={handleClose} style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #E8E8E8', background: 'white', color: '#666', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: saving ? '#C0BADF' : '#4429A6', color: 'white', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif', transition: 'background 0.15s' }}>
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
