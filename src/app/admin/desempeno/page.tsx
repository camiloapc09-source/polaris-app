import Link from 'next/link'
import { prisma } from '@/lib/db'
import { StatCard } from '@/components/dashboard/StatCard'
import { ClipboardList, AlertTriangle } from 'lucide-react'
import { NuevaRevisionForm, EditarRevisionButton, type EmployeeOption } from './RevisionForms'
import type { ChecklistItem } from '@/app/actions/desempeno'

const STATUS_INFO: Record<string, { label: string; bg: string; color: string }> = {
  DRAFT:     { label: 'Borrador',  bg: '#FEF9C3', color: '#A16207' },
  COMPLETED: { label: 'Cerrada',   bg: '#DCFCE7', color: '#15803D' },
}

function labelPeriodo(period: string) {
  const [y, m] = period.split('-')
  const yn = parseInt(y), mn = parseInt(m)
  if (isNaN(yn) || isNaN(mn) || mn < 1 || mn > 12) return period
  // Date en UTC — mismo criterio que el resto del proyecto
  return new Date(Date.UTC(yn, mn - 1, 1)).toLocaleString('es-CO', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

function parseChecklist(raw: unknown): ChecklistItem[] {
  return Array.isArray(raw) ? (raw as ChecklistItem[]) : []
}

function colorPercent(p: number) {
  if (p >= 80) return '#15803D'
  if (p >= 50) return '#A16207'
  return '#B91C1C'
}

export default async function AdminDesempenoPage() {
  const [employees, plantillas] = await Promise.all([
    prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      include: {
        company: true,
        performanceReviews: {
          orderBy: { period: 'desc' },
          include: { reviewedBy: { select: { name: true } } },
        },
      },
      orderBy: { firstName: 'asc' },
    }),
    prisma.checklistTemplate.findMany({
      where: { isActive: true },
      select: { position: true },
    }),
  ])

  const cargosConPlantilla = new Set(plantillas.map((p) => p.position))

  const opciones: EmployeeOption[] = employees.map((e) => ({
    id: e.id,
    firstName: e.firstName,
    lastName: e.lastName,
    position: e.position,
    tienePlantilla: cargosConPlantilla.has(e.position),
  }))

  const todas = employees.flatMap((e) => e.performanceReviews)
  const cerradas = todas.filter((r) => r.status === 'COMPLETED')
  const borradores = todas.filter((r) => r.status === 'DRAFT').length
  const promedio = cerradas.length
    ? Math.round((cerradas.reduce((s, r) => s + r.completionPercent, 0) / cerradas.length) * 10) / 10
    : 0

  const sinPlantilla = opciones.filter((o) => !o.tienePlantilla)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
            Star Shine · Polaris
          </p>
          <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Desempeño
          </h1>
          <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
            Revisión mensual del cumplimiento de funciones de cada trabajador
          </p>
        </div>
        <NuevaRevisionForm employees={opciones} />
      </div>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard
          title="Cumplimiento promedio"
          value={`${promedio}%`}
          subtitle="Sobre revisiones cerradas"
          accent
        />
        <StatCard title="Revisiones cerradas" value={cerradas.length.toString()} subtitle="Firmadas por el supervisor" />
        <StatCard title="Borradores" value={borradores.toString()} subtitle="Pendientes de diligenciar" />
        <StatCard title="Trabajadores activos" value={employees.length.toString()} subtitle="Sujetos a revisión" />
      </div>

      {/* Aviso: cargos sin plantilla */}
      {sinPlantilla.length > 0 && (
        <div style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          background: '#FEF9C3', border: '1px solid #FDE68A', borderRadius: 14,
          padding: '16px 18px', marginBottom: 28,
        }}>
          <AlertTriangle size={18} color="#A16207" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 13, color: '#A16207', lineHeight: 1.55 }}>
            <strong>Hay cargos sin plantilla de tareas activa.</strong> No se puede crear revisión para:{' '}
            {sinPlantilla.map((o) => `${o.firstName} ${o.lastName} ("${o.position}")`).join(', ')}.
            <br />
            El cargo del trabajador debe coincidir exactamente con el de la plantilla.{' '}
            <Link href="/admin/plantillas" style={{ color: '#A16207', fontWeight: 700, textDecoration: 'underline' }}>
              Ir a Plantillas de Tareas
            </Link>
          </div>
        </div>
      )}

      {/* Trabajadores y su historial */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {employees.map((emp) => {
          const reviews = emp.performanceReviews
          const ultima = reviews[0]
          const initial = emp.firstName.charAt(0) + emp.lastName.charAt(0)

          return (
            <div key={emp.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', overflow: 'hidden' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 24px', borderBottom: reviews.length > 0 ? '1px solid #F8F8F8' : 'none',
                flexWrap: 'wrap', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#4429A6,#F2421B)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{initial}</span>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#0F1026' }}>
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p style={{ fontSize: 12, color: '#A2A2A2' }}>{emp.position} · {emp.company.name}</p>
                  </div>
                </div>

                {ultima ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 11, color: '#A2A2A2', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Última revisión
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0F1026' }}>{labelPeriodo(ultima.period)}</p>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 60 }}>
                      <p style={{ fontSize: 22, fontWeight: 800, color: colorPercent(ultima.completionPercent) }}>
                        {ultima.completionPercent}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: '#A2A2A2' }}>Sin revisiones registradas</span>
                )}
              </div>

              {reviews.length > 0 && (
                <div style={{ padding: '12px 24px 16px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#A2A2A2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                    Historial de revisiones
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {reviews.map((r) => {
                      const si = STATUS_INFO[r.status] || STATUS_INFO.DRAFT
                      const items = parseChecklist(r.checklistJson)
                      const hechas = items.filter((i) => i.completed).length
                      return (
                        <div key={r.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: '#F8F8FB', borderRadius: 10, padding: '10px 14px',
                          flexWrap: 'wrap', gap: 10,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <ClipboardList size={14} color="#4429A6" />
                            <div>
                              <p style={{ fontSize: 12, fontWeight: 600, color: '#0F1026' }}>
                                {labelPeriodo(r.period)} · {hechas}/{items.length} tareas
                              </p>
                              <p style={{ fontSize: 11, color: '#A2A2A2' }}>
                                Revisó: {r.reviewedBy?.name ?? '—'}
                              </p>
                              {r.observations && (
                                <p style={{ fontSize: 11, color: '#888', fontStyle: 'italic', marginTop: 2 }}>
                                  {r.observations}
                                </p>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: colorPercent(r.completionPercent) }}>
                              {r.completionPercent}%
                            </span>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
                              borderRadius: 99, fontSize: 11, fontWeight: 600, background: si.bg, color: si.color,
                            }}>
                              {si.label}
                            </span>
                            <EditarRevisionButton
                              reviewId={r.id}
                              nombre={`${emp.firstName} ${emp.lastName}`}
                              period={r.period}
                              items={items}
                              observations={r.observations ?? ''}
                              status={r.status}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
