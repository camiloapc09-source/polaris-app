import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { ClipboardList, Check, Minus } from 'lucide-react'
import type { ChecklistItem } from '@/app/actions/desempeno'

function labelPeriodo(period: string) {
  const [y, m] = period.split('-')
  const yn = parseInt(y), mn = parseInt(m)
  if (isNaN(yn) || isNaN(mn) || mn < 1 || mn > 12) return period
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

export default async function EmployeeDesempenoPage() {
  const session = await auth()
  const user = session?.user as any
  const employeeId = user?.employeeId

  // Sólo revisiones cerradas: un borrador es trabajo en curso del supervisor.
  const reviews = employeeId
    ? await prisma.performanceReview.findMany({
        where: { employeeId, status: 'COMPLETED' },
        orderBy: { period: 'desc' },
        include: { reviewedBy: { select: { name: true } } },
      })
    : []

  const promedio = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.completionPercent, 0) / reviews.length) * 10) / 10
    : 0

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ color: '#0F1026', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
          Mi Desempeño
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
          Revisiones mensuales de tus funciones hechas por Star Shine
        </p>
      </div>

      {reviews.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 32 }}>
          <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)', borderRadius: 16, padding: 24, color: 'white' }}>
            <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Cumplimiento promedio</p>
            <p style={{ fontSize: 32, fontWeight: 800 }}>{promedio}%</p>
          </div>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
            <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Revisiones recibidas</p>
            <p style={{ color: '#0F1026', fontSize: 32, fontWeight: 800 }}>{reviews.length}</p>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', padding: '48px 24px', textAlign: 'center' }}>
          <ClipboardList size={28} color="#DDDDDD" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1026' }}>Aún no tienes revisiones</p>
          <p style={{ fontSize: 13, color: '#A2A2A2', marginTop: 4 }}>
            Cuando Star Shine cierre tu revisión mensual la verás aquí.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.map((r) => {
            const items = parseChecklist(r.checklistJson)
            const hechas = items.filter((i) => i.completed).length

            return (
              <div key={r.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', overflow: 'hidden' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '20px 24px', borderBottom: '1px solid #F8F8F8', flexWrap: 'wrap', gap: 12,
                }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#0F1026', textTransform: 'capitalize' }}>
                      {labelPeriodo(r.period)}
                    </p>
                    <p style={{ fontSize: 12, color: '#A2A2A2', marginTop: 2 }}>
                      Revisó: {r.reviewedBy?.name ?? '—'} · {formatDate(r.reviewedAt)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 26, fontWeight: 800, color: colorPercent(r.completionPercent) }}>
                      {r.completionPercent}%
                    </p>
                    <p style={{ fontSize: 11, color: '#A2A2A2' }}>{hechas} de {items.length} tareas</p>
                  </div>
                </div>

                <div style={{ padding: '16px 24px 20px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#A2A2A2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                    Funciones evaluadas
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {items.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        background: '#F8F8FB', borderRadius: 10, padding: '10px 14px',
                      }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                          background: item.completed ? '#DCFCE7' : '#F3F4F6',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {item.completed
                            ? <Check size={12} color="#15803D" strokeWidth={3} />
                            : <Minus size={12} color="#9CA3AF" strokeWidth={3} />}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: item.completed ? '#0F1026' : '#6B7280', lineHeight: 1.4 }}>
                            {item.taskName}
                          </p>
                          {item.note && (
                            <p style={{ fontSize: 12, color: '#888', fontStyle: 'italic', marginTop: 3 }}>
                              {item.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {r.observations && (
                    <div style={{ marginTop: 16, background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 12, padding: '14px 16px' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#4429A6', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        Observación del supervisor
                      </p>
                      <p style={{ fontSize: 13, color: '#0F1026', lineHeight: 1.55 }}>{r.observations}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
