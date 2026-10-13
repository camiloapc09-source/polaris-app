'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { createCitaMedica, cancelCitaMedica } from '@/app/actions/citas'
import { CITA_TYPE_LABEL } from '@/lib/citas'

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

const EMPTY = { type: 'GENERAL', appointmentAt: '', durationHours: '', place: '', reason: '', documentUrl: '' }

export function NuevaCitaForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY)

  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    set('documentUrl', data.url || '')
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createCitaMedica(form)
      setDone(true)
      setTimeout(() => {
        setOpen(false)
        setDone(false)
        setForm(EMPTY)
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Error al enviar la solicitud')
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
        Reportar cita médica
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,16,38,0.55)',
          zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 480, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F1026' }}>Reportar cita médica</h2>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: '#A2A2A2', marginBottom: 24 }}>
              Star Shine aprobará tu permiso y tu empleador verá la solicitud.
            </p>

            {done ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                <p style={{ fontWeight: 700, color: '#0F1026', fontSize: 16 }}>Solicitud enviada</p>
                <p style={{ color: '#888', fontSize: 13, marginTop: 6 }}>Te avisaremos aquí cuando sea aprobada</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Tipo de cita</label>
                  <select style={inputStyle} value={form.type} onChange={(e) => set('type', e.target.value)}>
                    {Object.entries(CITA_TYPE_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Fecha y hora</label>
                    <input style={inputStyle} type="datetime-local" required value={form.appointmentAt} onChange={(e) => set('appointmentAt', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Duración (h)</label>
                    <input style={inputStyle} type="number" min="0.5" max="24" step="0.5" placeholder="2" value={form.durationHours} onChange={(e) => set('durationHours', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Lugar (EPS / clínica)</label>
                  <input style={inputStyle} value={form.place} onChange={(e) => set('place', e.target.value)} placeholder="Ej: Sura - Sede Norte" />
                </div>

                <div>
                  <label style={labelStyle}>Motivo (opcional)</label>
                  <textarea
                    style={{ ...inputStyle, resize: 'none' }}
                    rows={3}
                    value={form.reason}
                    onChange={(e) => set('reason', e.target.value)}
                    placeholder="Ej: Control con ortopedia"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Soporte de la cita (opcional)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} style={{ fontSize: 12 }} />
                  {uploading && <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Subiendo...</p>}
                  {form.documentUrl && <p style={{ fontSize: 11, color: '#22C55E', marginTop: 4 }}>✓ Soporte cargado</p>}
                </div>

                {error && <p style={{ fontSize: 12, color: '#B91C1C' }}>{error}</p>}

                <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    style={{ flex: 1, background: '#F4F4F7', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, color: '#0F1026', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || uploading}
                    style={{ flex: 1, background: '#4429A6', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', opacity: loading || uploading ? 0.6 : 1 }}
                  >
                    {loading ? 'Enviando...' : 'Enviar solicitud'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export function CancelarCitaButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  return (
    <button
      onClick={async () => {
        if (!confirm('¿Cancelar esta solicitud de cita?')) return
        setLoading(true)
        try {
          await cancelCitaMedica(id)
        } catch (err: any) {
          alert(err.message || 'No se pudo cancelar')
        } finally {
          setLoading(false)
        }
      }}
      disabled={loading}
      style={{ background: '#F4F4F7', border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#888', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
    >
      {loading ? 'Cancelando...' : 'Cancelar'}
    </button>
  )
}
