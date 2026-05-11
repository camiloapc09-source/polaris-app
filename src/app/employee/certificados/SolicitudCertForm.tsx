'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { requestCertificado } from '@/app/actions/certificados'

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

export function SolicitudCertForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({ type: 'CARTA_LABORAL', requestNote: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await requestCertificado(form)
    setDone(true)
    setLoading(false)
    setTimeout(() => {
      setOpen(false)
      setDone(false)
      setForm({ type: 'CARTA_LABORAL', requestNote: '' })
    }, 1500)
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
        Solicitar certificado
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,16,38,0.55)',
          zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 440, padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F1026' }}>Solicitar Certificado</h2>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={20} />
              </button>
            </div>

            {done ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                <p style={{ fontWeight: 700, color: '#0F1026', fontSize: 16 }}>Solicitud enviada</p>
                <p style={{ color: '#888', fontSize: 13, marginTop: 6 }}>Star Shine procesará tu certificado pronto</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#A2A2A2', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
                    Tipo de certificado
                  </label>
                  <select
                    style={inputStyle}
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    <option value="CARTA_LABORAL">Carta Laboral</option>
                    <option value="CERT_INGRESOS">Certificado de Ingresos</option>
                    <option value="CERT_VACACIONES">Certificado de Vacaciones</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#A2A2A2', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
                    Nota adicional (opcional)
                  </label>
                  <textarea
                    style={{ ...inputStyle, resize: 'none' }}
                    rows={3}
                    value={form.requestNote}
                    onChange={(e) => setForm((f) => ({ ...f, requestNote: e.target.value }))}
                    placeholder="Ej: Para trámite bancario, incluir salario..."
                  />
                </div>

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
                    disabled={loading}
                    style={{ flex: 1, background: '#4429A6', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
                  >
                    {loading ? 'Enviando...' : 'Solicitar'}
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
