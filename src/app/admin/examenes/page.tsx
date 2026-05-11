import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { NuevoExamenForm } from './NuevoExamenForm'
import { Stethoscope, AlertTriangle, CheckCircle2, Clock, ExternalLink } from 'lucide-react'

const RESULT_INFO: Record<string, { label: string; bg: string; color: string }> = {
  APTO:                    { label: 'Apto',                    bg: '#DCFCE7', color: '#15803D' },
  APTO_CON_RESTRICCIONES:  { label: 'Apto c/ restricciones',   bg: '#FEF9C3', color: '#A16207' },
  NO_APTO:                 { label: 'No apto',                 bg: '#FEE2E2', color: '#B91C1C' },
  PENDIENTE:               { label: 'Pend. resultado',         bg: '#F3F4F6', color: '#6B7280' },
}

const TYPE_LABEL: Record<string, string> = {
  INGRESO: 'Ingreso', PERIODICO: 'Periódico', EGRESO: 'Egreso',
}

function examStatus(nextDate: Date | null) {
  if (!nextDate) return { icon: Clock, color: '#A2A2A2', label: 'Sin próx. fecha' }
  const days = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return { icon: AlertTriangle, color: '#EF4444', label: `Vencido hace ${Math.abs(days)} días` }
  if (days <= 30) return { icon: AlertTriangle, color: '#F59E0B', label: `Vence en ${days} días` }
  return { icon: CheckCircle2, color: '#22C55E', label: `Próx. en ${days} días` }
}

export default async function AdminExamenesPage() {
  const employees = await prisma.employee.findMany({
    where: { status: 'ACTIVE' },
    include: {
      company: true,
      examenesMedicos: { orderBy: { examDate: 'desc' } },
    },
    orderBy: { firstName: 'asc' },
  })

  const allExams = employees.flatMap((e) => e.examenesMedicos)
  const overdue = employees.filter((e) => {
    const last = e.examenesMedicos[0]
    if (!last?.nextExamDate) return false
    return last.nextExamDate < new Date()
  }).length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
            Star Shine · Polaris
          </p>
          <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Exámenes Médicos
          </h1>
          <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>Control de aptitud médica de empleados</p>
        </div>
        <NuevoExamenForm employees={employees} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #F2421B 100%)', borderRadius: 16, padding: 24, color: 'white' }}>
          <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Total exámenes</p>
          <p style={{ fontSize: 32, fontWeight: 800 }}>{allExams.length}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Empleados sin exam. vencido</p>
          <p style={{ color: '#0F1026', fontSize: 32, fontWeight: 800 }}>{employees.length - overdue}</p>
        </div>
        <div style={{ background: overdue > 0 ? '#FEF2F2' : 'white', borderRadius: 16, padding: 24, border: overdue > 0 ? '1px solid #FECACA' : '1px solid #EFEFEF' }}>
          <p style={{ color: overdue > 0 ? '#B91C1C' : '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Exámenes vencidos</p>
          <p style={{ color: overdue > 0 ? '#EF4444' : '#0F1026', fontSize: 32, fontWeight: 800 }}>{overdue}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {employees.map((emp) => {
          const exams = emp.examenesMedicos
          const latest = exams[0]
          const status = examStatus(latest?.nextExamDate ?? null)
          const StatusIcon = status.icon
          const resultInfo = latest ? (RESULT_INFO[latest.result] || RESULT_INFO.PENDIENTE) : null
          const initial = emp.firstName.charAt(0) + emp.lastName.charAt(0)

          return (
            <div key={emp.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: exams.length > 0 ? '1px solid #F8F8F8' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#4429A6,#F2421B)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{initial}</span>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#0F1026' }}>{emp.firstName} {emp.lastName}</p>
                    <p style={{ fontSize: 12, color: '#A2A2A2' }}>{emp.position} · {emp.company.name}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {resultInfo && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: resultInfo.bg, color: resultInfo.color }}>
                      {resultInfo.label}
                    </span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StatusIcon size={15} color={status.color} />
                    <span style={{ fontSize: 12, color: status.color, fontWeight: 600 }}>{status.label}</span>
                  </div>
                  {!latest && (
                    <span style={{ fontSize: 12, color: '#A2A2A2' }}>Sin exámenes registrados</span>
                  )}
                </div>
              </div>

              {/* Exam history */}
              {exams.length > 0 && (
                <div style={{ padding: '12px 24px 16px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#A2A2A2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                    Historial de exámenes
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {exams.slice(0, 3).map((ex) => {
                      const ri = RESULT_INFO[ex.result] || RESULT_INFO.PENDIENTE
                      return (
                        <div key={ex.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8F8FB', borderRadius: 10, padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Stethoscope size={14} color="#4429A6" />
                            <div>
                              <p style={{ fontSize: 12, fontWeight: 600, color: '#0F1026' }}>
                                {TYPE_LABEL[ex.type] || ex.type} · {formatDate(ex.examDate)}
                              </p>
                              {ex.clinic && <p style={{ fontSize: 11, color: '#A2A2A2' }}>{ex.clinic}</p>}
                              {ex.notes && <p style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>{ex.notes}</p>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: ri.bg, color: ri.color }}>
                              {ri.label}
                            </span>
                            {ex.evidenceUrl && (
                              <a href={ex.evidenceUrl} target="_blank" rel="noopener noreferrer"
                                style={{ color: '#4429A6', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                                <ExternalLink size={12} /> Ver
                              </a>
                            )}
                            {ex.nextExamDate && (
                              <span style={{ fontSize: 11, color: '#888' }}>Próx: {formatDate(ex.nextExamDate)}</span>
                            )}
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
