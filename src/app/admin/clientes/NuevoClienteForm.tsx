'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { createCompany } from '@/app/actions/organizacion'

const inputStyle = {
  width: '100%',
  background: '#F4F4F7',
  border: '1.5px solid transparent',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 13,
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
  marginBottom: 5,
}

const VACIO = { name: '', country: 'US', currency: 'USD', contactName: '', contactEmail: '' }

export function NuevoClienteForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(VACIO)

  function set(k: keyof typeof VACIO, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function reset() {
    setOpen(false); setForm(VACIO); setError(''); setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await createCompany(form)
      reset()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al crear el cliente')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#4429A6', color: 'white', border: 'none', borderRadius: 12,
          padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        <Plus size={16} />
        Nuevo cliente
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,16,38,0.55)',
            zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) reset() }}
        >
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F1026' }}>Nuevo cliente</h2>
              <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: '#A2A2A2', marginBottom: 24 }}>
              La empresa debe existir antes de poder registrarle trabajadores o darle acceso.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Nombre de la empresa</label>
                <input
                  style={inputStyle}
                  required
                  autoFocus
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Ej: BlueSky"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>País</label>
                  <input
                    style={inputStyle}
                    required
                    value={form.country}
                    onChange={(e) => set('country', e.target.value)}
                    placeholder="US"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Moneda</label>
                  <select style={inputStyle} value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                    <option value="USD">USD — Dólar</option>
                    <option value="COP">COP — Peso colombiano</option>
                    <option value="EUR">EUR — Euro</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Nombre del contacto</label>
                <input
                  style={inputStyle}
                  value={form.contactName}
                  onChange={(e) => set('contactName', e.target.value)}
                  placeholder="Opcional"
                />
              </div>

              <div>
                <label style={labelStyle}>Correo del contacto</label>
                <input
                  style={inputStyle}
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => set('contactEmail', e.target.value)}
                  placeholder="Opcional"
                />
              </div>

              {error && (
                <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 14px', borderRadius: 10 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={reset}
                  style={{ flex: 1, background: '#F4F4F7', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, color: '#0F1026', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1, background: '#4429A6', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? 'Creando...' : 'Crear cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
