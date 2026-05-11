'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { createExamen } from '@/app/actions/examenes'

type Employee = { id: string; firstName: string; lastName: string; company: { name: string } }

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

export function NuevoExamenForm({ employees }: { employees: Employee[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    employeeId: employees[0]?.id || '',
    type: 'PERIODICO',
    examDate: '',
    nextExamDate: '',
    clinic: '',
    result: 'APTO',
    evidenceUrl: '',
    notes: '',
  })

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    set('evidenceUrl', data.url)
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createExamen(form)
      setOpen(false)
      setForm({ employeeId: employees[0]?.id || '', type: 'PERIODICO', examDate: '', nextExamDate: '', clinic: '', result: 'APTO', evidenceUrl: '', notes: '' })
    } catch (err: any) {
      setError(err.message || 'Error al registrar examen')
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
        Registrar examen
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,16,38,0.55)',
          zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F1026' }}>Registrar Examen Médico</h2>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Empleado</label>
                <select style={inputStyle} required value={form.employeeId} onChange={(e) => set('employeeId', e.target.value)}>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} — {emp.company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Tipo de examen</label>
                  <select style={inputStyle} value={form.type} onChange={(e) => set('type', e.target.value)}>
                    <option value="INGRESO">Ingreso</option>
                    <option value="PERIODICO">Periódico</option>
                    <option value="EGRESO">Egreso</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Resultado</label>
                  <select style={inputStyle} value={form.result} onChange={(e) => set('result', e.target.value)}>
                    <option value="APTO">Apto</option>
                    <option value="APTO_CON_RESTRICCIONES">Apto con restricciones</option>
                    <option value="NO_APTO">No apto</option>
                    <option value="PENDIENTE">Pendiente resultado</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Fecha del examen</label>
                  <input style={inputStyle} type="date" required value={form.examDate} onChange={(e) => set('examDate', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Próximo examen</label>
                  <input style={inputStyle} type="date" value={form.nextExamDate} onChange={(e) => set('nextExamDate', e.target.value)} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Clínica / IPS</label>
                <input style={inputStyle} value={form.clinic} onChange={(e) => set('clinic', e.target.value)} placeholder="Colmedica, Compensar..." />
              </div>

              <div>
                <label style={labelStyle}>Adjuntar evidencia (PDF / imagen)</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} style={{ fontSize: 13 }} />
                {uploading && <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Subiendo archivo...</p>}
                {form.evidenceUrl && !uploading && <p style={{ fontSize: 11, color: '#22C55E', marginTop: 4 }}>✓ Evidencia cargada</p>}
              </div>

              <div>
                <label style={labelStyle}>Notas</label>
                <textarea
                  style={{ ...inputStyle, resize: 'none' }}
                  rows={2}
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Observaciones del médico..."
                />
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
                <button type="submit" disabled={loading || uploading}
                  style={{ flex: 1, background: '#4429A6', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', opacity: (loading || uploading) ? 0.6 : 1 }}>
                  {loading ? 'Guardando...' : 'Guardar examen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
