'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, ClipboardCheck, Pencil } from 'lucide-react'
import {
  createPerformanceReview,
  updatePerformanceReview,
  type ChecklistItem,
} from '@/app/actions/desempeno'

// ── estilos compartidos (mismo lenguaje visual que NuevoExamenForm) ────────

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

export type EmployeeOption = {
  id: string
  firstName: string
  lastName: string
  position: string
  tienePlantilla: boolean
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,16,38,0.55)',
        zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
        {children}
      </div>
    </div>
  )
}

// ── Editor del checklist (paso 2, y también edición de una revisión existente) ──

function ChecklistEditor({
  reviewId,
  titulo,
  subtitulo,
  itemsIniciales,
  observacionesIniciales,
  onDone,
  onCancel,
}: {
  reviewId: string
  titulo: string
  subtitulo: string
  itemsIniciales: ChecklistItem[]
  observacionesIniciales: string
  onDone: () => void
  onCancel: () => void
}) {
  const [items, setItems] = useState<ChecklistItem[]>(itemsIniciales)
  const [observations, setObservations] = useState(observacionesIniciales)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const completadas = items.filter((i) => i.completed).length
  const percent = items.length === 0 ? 0 : Math.round((completadas / items.length) * 1000) / 10

  function toggle(idx: number) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, completed: !it.completed } : it)))
  }

  function setNote(idx: number, note: string) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, note } : it)))
  }

  async function handleSave() {
    setLoading(true)
    setError('')
    try {
      const limpios = items.map((i) => ({
        taskName: i.taskName,
        completed: i.completed,
        note: i.note?.trim() ? i.note.trim() : undefined,
      }))
      await updatePerformanceReview(reviewId, limpios, observations)
      onDone()
    } catch (err: any) {
      setError(err.message || 'Error al guardar la revisión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F1026' }}>{titulo}</h2>
          <p style={{ fontSize: 13, color: '#A2A2A2', marginTop: 2 }}>{subtitulo}</p>
        </div>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
          <X size={20} />
        </button>
      </div>

      {/* Barra de cumplimiento en vivo */}
      <div style={{ background: '#F8F8FB', borderRadius: 12, padding: '14px 16px', margin: '18px 0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#A2A2A2' }}>
            {completadas} de {items.length} tareas cumplidas
          </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#4429A6' }}>{percent}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: '#E9E7F5', overflow: 'hidden' }}>
          <div style={{
            width: `${percent}%`, height: '100%', borderRadius: 99,
            background: 'linear-gradient(90deg, #4429A6 0%, #7F71D9 100%)',
            transition: 'width 0.2s',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {items.map((item, idx) => (
          <div key={idx} style={{
            background: item.completed ? '#F5F3FF' : '#FAFAFA',
            border: `1px solid ${item.completed ? '#DDD6FE' : '#EFEFEF'}`,
            borderRadius: 12, padding: '12px 14px',
          }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggle(idx)}
                style={{ accentColor: '#4429A6', width: 16, height: 16, marginTop: 2, flexShrink: 0 }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0F1026', lineHeight: 1.4 }}>
                {item.taskName}
              </span>
            </label>
            <input
              style={{ ...inputStyle, marginTop: 8, fontSize: 12, background: 'white', border: '1px solid #EFEFEF' }}
              placeholder="Observación de esta tarea (opcional)"
              value={item.note ?? ''}
              onChange={(e) => setNote(idx, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Observación general del supervisor</label>
        <textarea
          style={{ ...inputStyle, resize: 'none' }}
          rows={3}
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Resumen del desempeño del mes, compromisos y puntos a mejorar..."
        />
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 14px', borderRadius: 10, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" onClick={onCancel} style={{ ...secondaryBtn, flex: 1 }}>
          Cerrar
        </button>
        <button type="button" onClick={handleSave} disabled={loading} style={{ ...primaryBtn, flex: 1, opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Guardando...' : 'Guardar y cerrar revisión'}
        </button>
      </div>
    </>
  )
}

// ── Botón "Nueva revisión" (paso 1 → paso 2) ──────────────────────────────

function periodoActual() {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

export function NuevaRevisionForm({ employees }: { employees: EmployeeOption[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '')
  const [period, setPeriod] = useState(periodoActual())

  // Cuando la revisión ya fue creada pasamos al checklist
  const [creada, setCreada] = useState<{ id: string; checklist: ChecklistItem[]; nombre: string } | null>(null)

  const seleccionado = employees.find((e) => e.id === employeeId)

  function reset() {
    setOpen(false)
    setCreada(null)
    setError('')
    setLoading(false)
    setPeriod(periodoActual())
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await createPerformanceReview(employeeId, period)
      const emp = employees.find((x) => x.id === employeeId)
      setCreada({
        id: res.id,
        checklist: res.checklist,
        nombre: emp ? `${emp.firstName} ${emp.lastName}` : '',
      })
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al crear la revisión')
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
        Nueva revisión
      </button>

      {open && (
        <Modal onClose={reset}>
          {creada ? (
            <ChecklistEditor
              reviewId={creada.id}
              titulo="Revisión de desempeño"
              subtitulo={`${creada.nombre} · ${period}`}
              itemsIniciales={creada.checklist}
              observacionesIniciales=""
              onDone={() => { reset(); router.refresh() }}
              onCancel={() => { reset(); router.refresh() }}
            />
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F1026' }}>Nueva revisión mensual</h2>
                <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                  <X size={20} />
                </button>
              </div>
              <p style={{ fontSize: 13, color: '#A2A2A2', marginBottom: 24 }}>
                Se cargarán las tareas de la plantilla del cargo del trabajador.
              </p>

              <form onSubmit={handleCrear} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Trabajador</label>
                  <select style={inputStyle} required value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} — {emp.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Mes a revisar</label>
                  <input
                    style={inputStyle}
                    type="month"
                    required
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  />
                </div>

                {seleccionado && !seleccionado.tienePlantilla && (
                  <div style={{ background: '#FEF9C3', color: '#A16207', fontSize: 12, padding: '10px 14px', borderRadius: 10, lineHeight: 1.5 }}>
                    No hay plantilla activa para el cargo <strong>&ldquo;{seleccionado.position}&rdquo;</strong>.
                    Crea la plantilla de ese cargo antes de hacer la revisión.
                  </div>
                )}

                {error && (
                  <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 14px', borderRadius: 10 }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" onClick={reset} style={{ ...secondaryBtn, flex: 1 }}>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !seleccionado?.tienePlantilla}
                    style={{ ...primaryBtn, flex: 1, opacity: loading || !seleccionado?.tienePlantilla ? 0.5 : 1 }}
                  >
                    {loading ? 'Creando...' : 'Cargar checklist'}
                  </button>
                </div>
              </form>
            </>
          )}
        </Modal>
      )}
    </>
  )
}

// ── Botón para continuar / editar una revisión existente ──────────────────

export function EditarRevisionButton({
  reviewId,
  nombre,
  period,
  items,
  observations,
  status,
}: {
  reviewId: string
  nombre: string
  period: string
  items: ChecklistItem[]
  observations: string
  status: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const esBorrador = status === 'DRAFT'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: esBorrador ? '#4429A6' : 'white',
          color: esBorrador ? 'white' : '#4429A6',
          border: esBorrador ? 'none' : '1.5px solid #DDD6FE',
          borderRadius: 10, padding: '7px 14px',
          fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}
      >
        {esBorrador ? <ClipboardCheck size={13} /> : <Pencil size={13} />}
        {esBorrador ? 'Diligenciar' : 'Editar'}
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <ChecklistEditor
            reviewId={reviewId}
            titulo="Revisión de desempeño"
            subtitulo={`${nombre} · ${period}`}
            itemsIniciales={items}
            observacionesIniciales={observations}
            onDone={() => { setOpen(false); router.refresh() }}
            onCancel={() => setOpen(false)}
          />
        </Modal>
      )}
    </>
  )
}
