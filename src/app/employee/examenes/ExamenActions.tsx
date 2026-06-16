'use client'

import { useState } from 'react'
import { X, CalendarClock, Upload } from 'lucide-react'
import { agendarCita, registrarResultado } from '@/app/actions/examenes'

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

type Examen = {
  id: string
  status: string
  clinic: string | null
}

// Botón + modal para que el empleado agende la cita con su EPS
export function AgendarCitaButton({ examen }: { examen: Examen }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [appointmentAt, setAppointmentAt] = useState('')
  const [clinic, setClinic] = useState(examen.clinic || '')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await agendarCita(examen.id, { appointmentAt, clinic })
      setOpen(false)
    } catch (err: any) {
      setError(err.message || 'Error al agendar la cita')
    } finally {
      setLoading(false)
    }
  }

  const isReschedule = examen.status === 'CITA_AGENDADA'

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: isReschedule ? '#F4F4F7' : '#4429A6', color: isReschedule ? '#0F1026' : 'white',
        border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
      }}>
        <CalendarClock size={14} />
        {isReschedule ? 'Reprogramar cita' : 'Agendar cita'}
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,16,38,0.55)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 460, padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: '#0F1026' }}>Agendar cita médica</h2>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: '#A2A2A2', marginBottom: 24 }}>
              Indica el día y la hora de la cita que sacaste con tu EPS.
            </p>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Fecha y hora de la cita</label>
                <input style={inputStyle} type="datetime-local" required value={appointmentAt} onChange={(e) => setAppointmentAt(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Clínica / IPS</label>
                <input style={inputStyle} value={clinic} onChange={(e) => setClinic(e.target.value)} placeholder="Colmedica, Compensar..." />
              </div>
              {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 14px', borderRadius: 10 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, background: '#F4F4F7', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, color: '#0F1026', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={loading} style={{ flex: 1, background: '#4429A6', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Guardando...' : 'Confirmar cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// Botón + modal para registrar resultado y subir historia clínica
export function RegistrarResultadoButton({ examen }: { examen: Examen }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState('APTO')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [examDate, setExamDate] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setEvidenceUrl(data.url)
    setUploading(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await registrarResultado(examen.id, { result, evidenceUrl, examDate })
      setOpen(false)
    } catch (err: any) {
      setError(err.message || 'Error al registrar el resultado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: '#15803D', color: 'white',
        border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
      }}>
        <Upload size={14} />
        Registrar resultado
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,16,38,0.55)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 460, padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: '#0F1026' }}>Registrar resultado</h2>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: '#A2A2A2', marginBottom: 24 }}>
              Una vez asistas a tu cita, registra el resultado y sube tu historia clínica / certificado.
            </p>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Resultado</label>
                  <select style={inputStyle} value={result} onChange={(e) => setResult(e.target.value)}>
                    <option value="APTO">Apto</option>
                    <option value="APTO_CON_RESTRICCIONES">Apto con restricciones</option>
                    <option value="NO_APTO">No apto</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Fecha del examen</label>
                  <input style={inputStyle} type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Historia clínica / certificado (PDF o imagen)</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} style={{ fontSize: 13 }} />
                {uploading && <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Subiendo archivo...</p>}
                {evidenceUrl && !uploading && <p style={{ fontSize: 11, color: '#22C55E', marginTop: 4 }}>✓ Documento cargado</p>}
              </div>
              {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 14px', borderRadius: 10 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, background: '#F4F4F7', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, color: '#0F1026', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={loading || uploading} style={{ flex: 1, background: '#15803D', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', opacity: (loading || uploading) ? 0.6 : 1 }}>
                  {loading ? 'Guardando...' : 'Finalizar examen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
