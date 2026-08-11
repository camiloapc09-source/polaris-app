'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Pencil, Trash2, Eye, EyeOff, Copy } from 'lucide-react'
import {
  addTemplateTask,
  updateTemplateTask,
  toggleTemplateTask,
  deleteTemplateTask,
  duplicateTemplate,
} from '@/app/actions/desempeno'

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

const primaryBtn = {
  background: '#4429A6', border: 'none', borderRadius: 12,
  padding: '12px', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer',
} as const

const secondaryBtn = {
  background: '#F4F4F7', border: 'none', borderRadius: 12,
  padding: '12px', fontSize: 13, fontWeight: 600, color: '#0F1026', cursor: 'pointer',
} as const

const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: 5, borderRadius: 8, display: 'flex', alignItems: 'center',
} as const

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,16,38,0.55)',
        zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
        {children}
      </div>
    </div>
  )
}

function ErrorBox({ msg }: { msg: string }) {
  if (!msg) return null
  return (
    <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 14px', borderRadius: 10 }}>
      {msg}
    </div>
  )
}

// ── Crear cargo nuevo (con su primera tarea) ──────────────────────────────

export function NuevoCargoButton({ cargosSugeridos }: { cargosSugeridos: string[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState('')
  const [taskName, setTaskName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setOpen(false); setPosition(''); setTaskName(''); setError(''); setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await addTemplateTask(position, taskName)
      reset()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al crear la plantilla')
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
        Nuevo cargo
      </button>

      {open && (
        <Modal onClose={reset}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F1026' }}>Nueva plantilla de cargo</h2>
            <button onClick={reset} style={{ ...iconBtn, color: '#888' }}><X size={20} /></button>
          </div>
          <p style={{ fontSize: 13, color: '#A2A2A2', marginBottom: 24 }}>
            El cargo debe escribirse <strong>exactamente igual</strong> que en la ficha del trabajador.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Cargo</label>
              <input
                style={inputStyle}
                required
                list="cargos-existentes"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Ej: Asistente Administrativa y Financiera"
              />
              <datalist id="cargos-existentes">
                {cargosSugeridos.map((c) => <option key={c} value={c} />)}
              </datalist>
              {cargosSugeridos.length > 0 && (
                <p style={{ fontSize: 11, color: '#A2A2A2', marginTop: 5 }}>
                  Cargos de trabajadores registrados: {cargosSugeridos.join(' · ')}
                </p>
              )}
            </div>

            <div>
              <label style={labelStyle}>Primera tarea</label>
              <input
                style={inputStyle}
                required
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Ej: Documentación física y digital organizada"
              />
            </div>

            <ErrorBox msg={error} />

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={reset} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
              <button type="submit" disabled={loading} style={{ ...primaryBtn, flex: 1, opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Creando...' : 'Crear plantilla'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

// ── Agregar tarea a un cargo existente ────────────────────────────────────

export function AgregarTareaButton({ position }: { position: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [taskName, setTaskName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function reset() { setOpen(false); setTaskName(''); setError(''); setLoading(false) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await addTemplateTask(position, taskName)
      reset()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al agregar la tarea')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'white', color: '#4429A6', border: '1.5px solid #DDD6FE',
          borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}
      >
        <Plus size={13} /> Agregar tarea
      </button>

      {open && (
        <Modal onClose={reset}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F1026' }}>Agregar tarea</h2>
            <button onClick={reset} style={{ ...iconBtn, color: '#888' }}><X size={20} /></button>
          </div>
          <p style={{ fontSize: 13, color: '#A2A2A2', marginBottom: 24 }}>Cargo: <strong>{position}</strong></p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Tarea / función</label>
              <input style={inputStyle} required autoFocus value={taskName} onChange={(e) => setTaskName(e.target.value)} />
            </div>
            <ErrorBox msg={error} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={reset} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
              <button type="submit" disabled={loading} style={{ ...primaryBtn, flex: 1, opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

// ── Duplicar plantilla a otro cargo ───────────────────────────────────────

export function DuplicarButton({ fromPosition, cargosSugeridos }: { fromPosition: string; cargosSugeridos: string[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [toPosition, setToPosition] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function reset() { setOpen(false); setToPosition(''); setError(''); setLoading(false) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await duplicateTemplate(fromPosition, toPosition)
      reset()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al duplicar')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'white', color: '#6B7280', border: '1.5px solid #E8E8E8',
          borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}
      >
        <Copy size={13} /> Duplicar a otro cargo
      </button>

      {open && (
        <Modal onClose={reset}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F1026' }}>Duplicar plantilla</h2>
            <button onClick={reset} style={{ ...iconBtn, color: '#888' }}><X size={20} /></button>
          </div>
          <p style={{ fontSize: 13, color: '#A2A2A2', marginBottom: 24 }}>
            Copia todas las tareas de <strong>{fromPosition}</strong> a un cargo nuevo. Útil cuando
            un trabajador cambia de cargo: clonas y luego ajustas, sin tocar la original.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Cargo de destino</label>
              <input
                style={inputStyle}
                required
                autoFocus
                list="cargos-destino"
                value={toPosition}
                onChange={(e) => setToPosition(e.target.value)}
                placeholder="Ej: Coordinadora Administrativa"
              />
              <datalist id="cargos-destino">
                {cargosSugeridos.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <ErrorBox msg={error} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={reset} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
              <button type="submit" disabled={loading} style={{ ...primaryBtn, flex: 1, opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Duplicando...' : 'Duplicar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

// ── Acciones por tarea: editar / activar / eliminar ───────────────────────

export function TareaActions({ id, taskName, isActive }: { id: string; taskName: string; isActive: boolean }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [valor, setValor] = useState(taskName)
  const [confirmando, setConfirmando] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function run(fn: () => Promise<void>) {
    setLoading(true); setError('')
    try {
      await fn()
      router.refresh()
      setEditing(false)
      setConfirmando(false)
    } catch (err: any) {
      setError(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <button
          onClick={() => { setValor(taskName); setEditing(true) }}
          title="Editar"
          style={{ ...iconBtn, color: '#A2A2A2' }}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => run(() => toggleTemplateTask(id))}
          disabled={loading}
          title={isActive ? 'Desactivar (no se incluirá en revisiones nuevas)' : 'Activar'}
          style={{ ...iconBtn, color: isActive ? '#15803D' : '#BBBBBB' }}
        >
          {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button
          onClick={() => setConfirmando(true)}
          title="Eliminar"
          style={{ ...iconBtn, color: '#DDDDDD' }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {editing && (
        <Modal onClose={() => setEditing(false)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F1026' }}>Editar tarea</h2>
            <button onClick={() => setEditing(false)} style={{ ...iconBtn, color: '#888' }}><X size={20} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Tarea / función</label>
              <input style={inputStyle} autoFocus value={valor} onChange={(e) => setValor(e.target.value)} />
            </div>
            <ErrorBox msg={error} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setEditing(false)} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
              <button
                onClick={() => run(() => updateTemplateTask(id, valor))}
                disabled={loading}
                style={{ ...primaryBtn, flex: 1, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirmando && (
        <Modal onClose={() => setConfirmando(false)}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F1026', marginBottom: 10 }}>Eliminar tarea</h2>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8, lineHeight: 1.6 }}>
            Se eliminará <strong>&ldquo;{taskName}&rdquo;</strong> de la plantilla.
          </p>
          <p style={{ fontSize: 12, color: '#A2A2A2', marginBottom: 24, lineHeight: 1.6 }}>
            Las revisiones ya creadas no se modifican: cada una guarda su propia copia del checklist.
            Si solo quieres dejar de usarla en revisiones futuras, desactívala en vez de borrarla.
          </p>
          <ErrorBox msg={error} />
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button onClick={() => setConfirmando(false)} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
            <button
              onClick={() => run(() => deleteTemplateTask(id))}
              disabled={loading}
              style={{ ...primaryBtn, flex: 1, background: '#B91C1C', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
