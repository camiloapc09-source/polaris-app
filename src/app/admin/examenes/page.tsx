import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { NuevoExamenForm } from './NuevoExamenForm'
import { Stethoscope, ExternalLink } from 'lucide-react'

const RESULT_INFO: Record<string, { label: string; bg: string; color: string }> = {
  APTO:                    { label: 'Apto',                    bg: '#DCFCE7', color: '#15803D' },
  APTO_CON_RESTRICCIONES:  { label: 'Apto c/ restricciones',   bg: '#FEF9C3', color: '#A16207' },
  NO_APTO:                 { label: 'No apto',                 bg: '#FEE2E2', color: '#B91C1C' },
  PENDIENTE:               { label: 'Pend. resultado',         bg: '#F3F4F6', color: '#6B7280' },
}

const STATUS_INFO: Record<string, { label: string; bg: string; color: string }> = {
  PROGRAMADO:    { label: 'Programado',    bg: '#EDE9FE', color: '#4429A6' },
  CITA_AGENDADA: { label: 'Cita agendada', bg: '#DBEAFE', color: '#1D4ED8' },
  REALIZADO:     { label: 'Realizado',     bg: '#DCFCE7', color: '#15803D' },
}

const TYPE_LABEL: Record<string, string> = {
  INGRESO: 'Ingreso', PERIODICO: 'Periódico', EGRESO: 'Egreso',
}

function formatDateTime(d: Date) {
  return d.toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function AdminExamenesPage() {
  const employees = await prisma.employee.findMany({
    where: { status: 'ACTIVE' },
    include: {
      company: true,
      examenesMedicos: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { firstName: 'asc' },
  })

  const allExams = employees.flatMap((e) => e.examenesMedicos)
  const programados = allExams.filter((e) => e.status === 'PROGRAMADO').length
  const agendados   = allExams.filter((e) => e.status === 'CITA_AGENDADA').length
  const realizados  = allExams.filter((e) => e.status === 'REALIZADO').length

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
          <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>Programa exámenes y haz seguimiento al flujo de cada empleado</p>
        </div>
        <NuevoExamenForm employees={employees} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)', borderRadius: 16, padding: 24, color: 'white' }}>
          <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Total exámenes</p>
          <p style={{ fontSize: 32, fontWeight: 800 }}>{allExams.length}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Programados</p>
          <p style={{ color: '#4429A6', fontSize: 32, fontWeight: 800 }}>{programados}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Citas agendadas</p>
          <p style={{ color: '#1D4ED8', fontSize: 32, fontWeight: 800 }}>{agendados}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Realizados</p>
          <p style={{ color: '#15803D', fontSize: 32, fontWeight: 800 }}>{realizados}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {employees.map((emp) => {
          const exams = emp.examenesMedicos
          const initial = emp.firstName.charAt(0) + emp.lastName.charAt(0)

          return (
            <div key={emp.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', overflow: 'hidden' }}>
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
                {exams.length === 0 && (
                  <span style={{ fontSize: 12, color: '#A2A2A2' }}>Sin exámenes programados</span>
                )}
              </div>

              {exams.length > 0 && (
                <div style={{ padding: '12px 24px 16px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#A2A2A2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                    Historial y seguimiento
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {exams.map((ex) => {
                      const si = STATUS_INFO[ex.status] || STATUS_INFO.PROGRAMADO
                      const ri = RESULT_INFO[ex.result] || RESULT_INFO.PENDIENTE
                      return (
                        <div key={ex.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8F8FB', borderRadius: 10, padding: '10px 14px', flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Stethoscope size={14} color="#4429A6" />
                            <div>
                              <p style={{ fontSize: 12, fontWeight: 600, color: '#0F1026' }}>
                                {TYPE_LABEL[ex.type] || ex.type}
                                {ex.appointmentAt && <> · Cita: {formatDateTime(ex.appointmentAt)}</>}
                                {!ex.appointmentAt && ex.examDate && <> · {formatDate(ex.examDate)}</>}
                              </p>
                              {ex.clinic && <p style={{ fontSize: 11, color: '#A2A2A2' }}>{ex.clinic}</p>}
                              {ex.notes && <p style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>{ex.notes}</p>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: si.bg, color: si.color }}>
                              {si.label}
                            </span>
                            {ex.status === 'REALIZADO' && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: ri.bg, color: ri.color }}>
                                {ri.label}
                              </span>
                            )}
                            {ex.evidenceUrl && (
                              <a href={ex.evidenceUrl} target="_blank" rel="noopener noreferrer"
                                style={{ color: '#4429A6', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                                <ExternalLink size={12} /> Historia clínica
                              </a>
                            )}
                            {ex.nextExamDate && ex.status !== 'REALIZADO' && (
                              <span style={{ fontSize: 11, color: '#888' }}>Límite: {formatDate(ex.nextExamDate)}</span>
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
