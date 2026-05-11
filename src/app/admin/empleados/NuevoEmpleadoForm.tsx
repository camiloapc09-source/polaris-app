'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { createEmployee } from '@/app/actions/empleados'

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

export function NuevoEmpleadoForm({ companies }: { companies: Company[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    position: '', startDate: '', salary: '',
    companyId: companies[0]?.id || '',
    cedula: '', bankName: '', bankAccount: '',
    conectividadDefault: '0', toolsDefault: '0',
  })

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createEmployee(form)
      setOpen(false)
      setForm({
        firstName: '', lastName: '', email: '', phone: '',
        position: '', startDate: '', salary: '',
        companyId: companies[0]?.id || '',
        cedula: '', bankName: '', bankAccount: '',
        conectividadDefault: '0', toolsDefault: '0',
      })
    } catch (err: any) {
      setError(err.message || 'Error al crear empleado')
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
        Nuevo Empleado
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,16,38,0.55)',
          zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            background: 'white', borderRadius: 20, width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflowY: 'auto', padding: 32,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F1026' }}>Nuevo Empleado</h2>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input style={inputStyle} required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Justine" />
                </div>
                <div>
                  <label style={labelStyle}>Apellido</label>
                  <input style={inputStyle} required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Smith" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="empleado@empresa.com" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Teléfono</label>
                  <input style={inputStyle} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+57 300 000 0000" />
                </div>
                <div>
                  <label style={labelStyle}>Cédula</label>
                  <input style={inputStyle} value={form.cedula} onChange={(e) => set('cedula', e.target.value)} placeholder="1234567890" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Cargo</label>
                  <input style={inputStyle} required value={form.position} onChange={(e) => set('position', e.target.value)} placeholder="Customer Support" />
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Fecha de inicio</label>
                  <input style={inputStyle} type="date" required value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Salario quincenal (COP)</label>
                  <input style={inputStyle} type="number" required value={form.salary} onChange={(e) => set('salary', e.target.value)} placeholder="1150000" />
                </div>
              </div>

              <div style={{ paddingTop: 12, borderTop: '1px solid #F0F0F0' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#4429A6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Beneficios por defecto
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Conectividad (COP)</label>
                    <input style={inputStyle} type="number" value={form.conectividadDefault} onChange={(e) => set('conectividadDefault', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Herramientas (COP)</label>
                    <input style={inputStyle} type="number" value={form.toolsDefault} onChange={(e) => set('toolsDefault', e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: 12, borderTop: '1px solid #F0F0F0' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#4429A6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Datos bancarios
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Banco</label>
                    <input style={inputStyle} value={form.bankName} onChange={(e) => set('bankName', e.target.value)} placeholder="Bancolombia" />
                  </div>
                  <div>
                    <label style={labelStyle}>Cuenta</label>
                    <input style={inputStyle} value={form.bankAccount} onChange={(e) => set('bankAccount', e.target.value)} placeholder="123-456789-00" />
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 14px', borderRadius: 10 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{ flex: 1, background: '#F4F4F7', border: 'none', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#0F1026', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1, background: '#4429A6', border: 'none', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? 'Creando...' : 'Crear Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
