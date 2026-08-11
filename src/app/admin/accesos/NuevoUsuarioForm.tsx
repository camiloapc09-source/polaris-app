'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Info } from 'lucide-react'
import { createUser } from '@/app/actions/organizacion'

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

export type CompanyOption = { id: string; name: string }
export type EmployeeOption = {
  id: string
  nombre: string
  companyName: string
  yaTieneUsuario: boolean
}

const VACIO = { name: '', email: '', password: '', role: 'EMPLOYEE', companyId: '', employeeId: '' }

const AYUDA: Record<string, string> = {
  ADMIN: 'Acceso total a Star Shine: nómina, facturas, aportes y todos los trabajadores.',
  CLIENT: 'Ve sólo lo de su empresa: facturas, pagos, colillas y soportes de sus trabajadores.',
  EMPLOYEE: 'Ve sólo lo suyo: colillas, incapacidades, certificados, exámenes y desempeño.',
}

export function NuevoUsuarioForm({
  companies,
  employees,
}: {
  companies: CompanyOption[]
  employees: EmployeeOption[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(VACIO)

  // Sólo se pueden vincular trabajadores que aún no tengan usuario
  const disponibles = employees.filter((e) => !e.yaTieneUsuario)

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
      await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        companyId: form.role === 'CLIENT' ? form.companyId : undefined,
        employeeId: form.role === 'EMPLOYEE' ? form.employeeId : undefined,
      })
      reset()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al crear el usuario')
      setLoading(false)
    }
  }

  // Bloqueos por falta de datos previos
  const faltaEmpresa = form.role === 'CLIENT' && companies.length === 0
  const faltaTrabajador = form.role === 'EMPLOYEE' && disponibles.length === 0

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
        Nuevo usuario
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
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F1026' }}>Nuevo usuario</h2>
              <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: '#A2A2A2', marginBottom: 24 }}>
              Crea la cuenta con la que la persona entrará a Polaris.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Rol</label>
                <select style={inputStyle} value={form.role} onChange={(e) => set('role', e.target.value)}>
                  <option value="EMPLOYEE">Empleado</option>
                  <option value="CLIENT">Cliente</option>
                  <option value="ADMIN">Star Shine (admin)</option>
                </select>
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginTop: 6 }}>
                  <Info size={12} color="#A2A2A2" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 11, color: '#A2A2A2', lineHeight: 1.5 }}>{AYUDA[form.role]}</p>
                </div>
              </div>

              {form.role === 'CLIENT' && (
                <div>
                  <label style={labelStyle}>Empresa</label>
                  {companies.length === 0 ? (
                    <div style={{ background: '#FEF9C3', color: '#A16207', fontSize: 12, padding: '10px 14px', borderRadius: 10, lineHeight: 1.5 }}>
                      No hay clientes registrados. Crea primero la empresa en <strong>Clientes</strong>.
                    </div>
                  ) : (
                    <select style={inputStyle} required value={form.companyId} onChange={(e) => set('companyId', e.target.value)}>
                      <option value="">Seleccionar...</option>
                      {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  )}
                </div>
              )}

              {form.role === 'EMPLOYEE' && (
                <div>
                  <label style={labelStyle}>Trabajador</label>
                  {disponibles.length === 0 ? (
                    <div style={{ background: '#FEF9C3', color: '#A16207', fontSize: 12, padding: '10px 14px', borderRadius: 10, lineHeight: 1.5 }}>
                      No hay trabajadores sin usuario. Créalo primero en <strong>Empleados</strong>.
                    </div>
                  ) : (
                    <>
                      <select style={inputStyle} required value={form.employeeId} onChange={(e) => set('employeeId', e.target.value)}>
                        <option value="">Seleccionar...</option>
                        {disponibles.map((e) => (
                          <option key={e.id} value={e.id}>{e.nombre} — {e.companyName}</option>
                        ))}
                      </select>
                      <p style={{ fontSize: 11, color: '#A2A2A2', marginTop: 5 }}>
                        La empresa se toma del trabajador. Sólo aparecen los que aún no tienen usuario.
                      </p>
                    </>
                  )}
                </div>
              )}

              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input style={inputStyle} required value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>Correo (con este entra)</label>
                <input style={inputStyle} type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>Contraseña inicial</label>
                <input
                  style={inputStyle}
                  type="text"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
                <p style={{ fontSize: 11, color: '#A2A2A2', marginTop: 5, lineHeight: 1.5 }}>
                  Se guarda cifrada. Comunícasela por un canal seguro y pídele que la cambie
                  desde <strong>Mi Cuenta</strong> al entrar.
                </p>
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
                  disabled={loading || faltaEmpresa || faltaTrabajador}
                  style={{
                    flex: 1, background: '#4429A6', border: 'none', borderRadius: 12,
                    padding: '12px', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer',
                    opacity: loading || faltaEmpresa || faltaTrabajador ? 0.5 : 1,
                  }}
                >
                  {loading ? 'Creando...' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
