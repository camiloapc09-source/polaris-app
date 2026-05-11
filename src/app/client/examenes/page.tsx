import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, Stethoscope } from 'lucide-react'

const RESULT_INFO: Record<string, { label: string; bg: string; color: string }> = {
  APTO:                   { label: 'Apto',                   bg: '#DCFCE7', color: '#15803D' },
  APTO_CON_RESTRICCIONES: { label: 'Apto c/ restricciones',  bg: '#FEF9C3', color: '#A16207' },
  NO_APTO:                { label: 'No apto',                bg: '#FEE2E2', color: '#B91C1C' },
  PENDIENTE:              { label: 'Pend. resultado',        bg: '#F3F4F6', color: '#6B7280' },
}

const TYPE_LABEL: Record<string, string> = {
  INGRESO: 'Ingreso', PERIODICO: 'Periódico', EGRESO: 'Egreso',
}

function examStatusInfo(nextDate: Date | null): { icon: any; color: string; label: string; bg: string } {
  if (!nextDate) return { icon: Clock, color: '#A2A2A2', label: 'Sin fecha próxima', bg: '#F3F4F6' }
  const days = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return { icon: AlertTriangle, color: '#EF4444', label: `Vencido hace ${Math.abs(days)} días`, bg: '#FEF2F2' }
  if (days <= 30) return { icon: AlertTriangle, color: '#F59E0B', label: `Vence en ${days} días`, bg: '#FFFBEB' }
  return { icon: CheckCircle2, color: '#22C55E', label: `Próximo en ${days} días`, bg: '#F0FDF4' }
}

export default async function ClientExamenesPage() {
  const session = await auth()
  const user = session?.user as any
  const companyId = user?.companyId

  const employees = await prisma.employee.findMany({
    where: { companyId, status: 'ACTIVE' },
    include: {
      examenesMedicos: { orderBy: { examDate: 'desc' } },
    },
    orderBy: { firstName: 'asc' },
  })

  const withExam = employees.filter((e) => e.examenesMedicos.length > 0).length
  const overdue = employees.filter((e) => {
    const last = e.examenesMedicos[0]
    return last?.nextExamDate && last.nextExamDate < new Date()
  }).length
  const upcoming = employees.filter((e) => {
    const last = e.examenesMedicos[0]
    if (!last?.nextExamDate) return false
    const days = Math.ceil((last.nextExamDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days >= 0 && days <= 30
  }).length

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ color: '#0F1026', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
          Exámenes Médicos
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
          Estado de aptitud médica de tu equipo
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #F2421B 100%)', borderRadius: 16, padding: 20, color: 'white' }}>
          <p style={{ fontSize: 11, opacity: 0.75, marginBottom: 6, fontWeight: 500 }}>Total empleados</p>
          <p style={{ fontSize: 28, fontWeight: 800 }}>{employees.length}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 11, marginBottom: 6, fontWeight: 500 }}>Con examen</p>
          <p style={{ color: '#0F1026', fontSize: 28, fontWeight: 800 }}>{withExam}</p>
        </div>
        <div style={{ background: upcoming > 0 ? '#FFFBEB' : 'white', borderRadius: 16, padding: 20, border: upcoming > 0 ? '1px solid #FDE68A' : '1px solid #EFEFEF' }}>
          <p style={{ color: upcoming > 0 ? '#B45309' : '#A2A2A2', fontSize: 11, marginBottom: 6, fontWeight: 500 }}>Próximos 30 días</p>
          <p style={{ color: upcoming > 0 ? '#F59E0B' : '#0F1026', fontSize: 28, fontWeight: 800 }}>{upcoming}</p>
        </div>
        <div style={{ background: overdue > 0 ? '#FEF2F2' : 'white', borderRadius: 16, padding: 20, border: overdue > 0 ? '1px solid #FECACA' : '1px solid #EFEFEF' }}>
          <p style={{ color: overdue > 0 ? '#B91C1C' : '#A2A2A2', fontSize: 11, marginBottom: 6, fontWeight: 500 }}>Vencidos</p>
          <p style={{ color: overdue > 0 ? '#EF4444' : '#0F1026', fontSize: 28, fontWeight: 800 }}>{overdue}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {employees.map((emp) => {
          const latest = emp.examenesMedicos[0]
          const status = examStatusInfo(latest?.nextExamDate ?? null)
          const StatusIcon = status.icon
          const resultInfo = latest ? (RESULT_INFO[latest.result] || RESULT_INFO.PENDIENTE) : null
          const initial = emp.firstName.charAt(0) + emp.lastName.charAt(0)

          return (
            <div
              key={emp.id}
              style={{
                background: 'white', borderRadius: 16,
                border: `1px solid ${overdue > 0 && latest?.nextExamDate && latest.nextExamDate < new Date() ? '#FECACA' : '#EFEFEF'}`,
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#4429A6,#F2421B)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{initial}</span>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#0F1026' }}>{emp.firstName} {emp.lastName}</p>
                    <p style={{ fontSize: 12, color: '#A2A2A2' }}>{emp.position}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {resultInfo ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: resultInfo.bg, color: resultInfo.color }}>
                      {resultInfo.label}
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: '#F3F4F6', color: '#6B7280' }}>
                      Sin exámenes
                    </span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: status.bg, borderRadius: 10, padding: '5px 12px' }}>
                    <StatusIcon size={14} color={status.color} />
                    <span style={{ fontSize: 12, color: status.color, fontWeight: 600 }}>{status.label}</span>
                  </div>
                </div>
              </div>

              {latest && (
                <div style={{ padding: '0 24px 16px', borderTop: '1px solid #F8F8F8', paddingTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8F8FB', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Stethoscope size={14} color="#4429A6" />
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#0F1026' }}>
                          Último: {TYPE_LABEL[latest.type] || latest.type} · {formatDate(latest.examDate)}
                        </p>
                        {latest.clinic && <p style={{ fontSize: 11, color: '#A2A2A2' }}>{latest.clinic}</p>}
                        {latest.nextExamDate && (
                          <p style={{ fontSize: 11, color: '#888' }}>
                            Próximo examen: {formatDate(latest.nextExamDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    {latest.evidenceUrl && (
                      <a
                        href={latest.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#4429A6', fontWeight: 600, textDecoration: 'none' }}
                      >
                        <ExternalLink size={13} /> Ver evidencia
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {employees.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', color: '#BBBBBB', fontSize: 14 }}>
            No tienes empleados activos registrados
          </div>
        )}
      </div>
    </div>
  )
}
