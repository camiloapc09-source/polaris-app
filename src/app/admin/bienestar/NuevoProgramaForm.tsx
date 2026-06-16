'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { createPrograma } from '@/app/actions/bienestar'

type Company = { id: string; name: string }

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

export function NuevoProgramaForm({ companies }: { companies: Company[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    category: 'PSICOLOGIA',
    description: '',
    provider: '',
    eventDate: '',
    location: '',
    capacity: '',
    companyId: companies[0]?.id || '',
  })

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createPrograma(form)
      setOpen(false)
      setForm({ title: '', category: 'PSICOLOGIA', description: '', provider: '', eventDate: '', location: '', capacity: '', companyId: companies[0]?.id || '' })
    } catch (err: any) {
      setError(err.message || 'Error al crear programa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#4429A6', color: 'white',
          border: 'none', borderRadius: 12, padding: '11px 20px',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        <Plus size={16} />
        Programar actividad
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,16,38,0.55)',
          zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F1026' }}>Programar actividad</h2>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Nombre del programa</label>
                <input style={inputStyle} required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ej: Charlas de manejo del estrés" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Categoría</label>
                  <select style={inputStyle} value={form.category} onChange={(e) => set('category', e.target.value)}>
                    <option value="PSICOLOGIA">Psicología</option>
                    <option value="ACTIVIDAD_FISICA">Actividad física</option>
                    <option value="NUTRICION">Nutrición</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Empresa cliente</label>
                  <select style={inputStyle} required value={form.companyId} onChange={(e) => set('companyId', e.target.value)}>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Descripción</label>
                <textarea
                  style={{ ...inputStyle, resize: 'none' }}
                  rows={2}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Breve descripción del beneficio..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Proveedor / aliado</label>
                  <input style={inputStyle} value={form.provider} onChange={(e) => set('provider', e.target.value)} placeholder="Nombre del proveedor" />
                </div>
                <div>
                  <label style={labelStyle}>Cupos máximos</label>
                  <input style={inputStyle} type="number" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} placeholder="Sin límite" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Fecha y hora</label>
                  <input style={inputStyle} type="datetime-local" value={form.eventDate} onChange={(e) => set('eventDate', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Lugar</label>
                  <input style={inputStyle} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Sede, dirección o enlace virtual" />
                </div>
              </div>

              {error && (
                <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 14px', borderRadius: 10 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setOpen(false)}
                  style={{ flex: 1, background: '#F4F4F7', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, color: '#0F1026', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  style={{ flex: 1, background: '#4429A6', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Creando...' : 'Programar actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
