import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { CalendarClock, CheckCircle2, ExternalLink, Stethoscope } from 'lucide-react'

const RESULT_INFO: Record<string, { label: string; bg: string; color: string }> = {
  APTO:                   { label: 'Apto',                   bg: '#DCFCE7', color: '#15803D' },
  APTO_CON_RESTRICCIONES: { label: 'Apto c/ restricciones',  bg: '#FEF9C3', color: '#A16207' },
  NO_APTO:                { label: 'No apto',                bg: '#FEE2E2', color: '#B91C1C' },
  PENDIENTE:              { label: 'Pend. resultado',        bg: '#F3F4F6', color: '#6B7280' },
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

export default async function ClientExamenesPage() {
  const session = await auth()
  const user = session?.user as any
  const companyId = user?.companyId

  const employees = await prisma.employee.findMany({
    where: { companyId, status: 'ACTIVE' },
    include: {
      examenesMedicos: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { firstName: 'asc' },
  })

  const allExams = employees.flatMap((e) => e.examenesMedicos)
  const withExam = employees.filter((e) => e.examenesMedicos.length > 0).length
  const agendados = allExams.filter((e) => e.status === 'CITA_AGENDADA').length
  const realizados = allExams.filter((e) => e.status === 'REALIZADO').length

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
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)', borderRadius: 16, padding: 20, color: 'white' }}>
          <p style={{ fontSize: 11, opacity: 0.75, marginBottom: 6, fontWeight: 500 }}>Total empleados</p>
          <p style={{ fontSize: 28, fontWeight: 800 }}>{employees.length}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 11, marginBottom: 6, fontWeight: 500 }}>Con examen</p>
          <p style={{ color: '#0F1026', fontSize: 28, fontWeight: 800 }}>{withExam}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 11, marginBottom: 6, fontWeight: 500 }}>Citas agendadas</p>
          <p style={{ color: '#1D4ED8', fontSize: 28, fontWeight: 800 }}>{agendados}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 11, marginBottom: 6, fontWeight: 500 }}>Realizados</p>
          <p style={{ color: '#15803D', fontSize: 28, fontWeight: 800 }}>{realizados}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {employees.map((emp) => {
          const exams = emp.examenesMedicos
          const latest = exams[0]
          const initial = emp.firstName.charAt(0) + emp.lastName.charAt(0)
          const si = latest ? (STATUS_INFO[latest.status] || STATUS_INFO.PROGRAMADO) : null

          return (
            <div key={emp.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', gap: 12, flexWrap: 'wrap' }}>
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
                  {si ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: si.bg, color: si.color }}>
                      {si.label}
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: '#F3F4F6', color: '#6B7280' }}>
                      Sin exámenes
                    </span>
                  )}
                </div>
              </div>

              {latest && (
                <div style={{ padding: '0 24px 16px', borderTop: '1px solid #F8F8F8', paddingTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8F8FB', borderRadius: 10, padding: '10px 14px', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {latest.status === 'CITA_AGENDADA'
                        ? <CalendarClock size={14} color="#1D4ED8" />
                        : latest.status === 'REALIZADO'
                        ? <CheckCircle2 size={14} color="#15803D" />
                        : <Stethoscope size={14} color="#4429A6" />}
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#0F1026' }}>
                          {TYPE_LABEL[latest.type] || latest.type}
                          {latest.status === 'CITA_AGENDADA' && latest.appointmentAt && <> · Cita: {formatDateTime(latest.appointmentAt)}</>}
                          {latest.status === 'REALIZADO' && latest.examDate && <> · Realizado: {formatDate(latest.examDate)}</>}
                          {latest.status === 'PROGRAMADO' && <> · Pendiente de agendar</>}
                        </p>
                        {latest.clinic && <p style={{ fontSize: 11, color: '#A2A2A2' }}>{latest.clinic}</p>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {latest.status === 'REALIZADO' && (() => {
                        const ri = RESULT_INFO[latest.result] || RESULT_INFO.PENDIENTE
                        return (
                          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: ri.bg, color: ri.color }}>
                            {ri.label}
                          </span>
                        )
                      })()}
                      {latest.evidenceUrl && (
                        <a href={latest.evidenceUrl} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#4429A6', fontWeight: 600, textDecoration: 'none' }}>
                          <ExternalLink size={13} /> Ver evidencia
                        </a>
                      )}
                    </div>
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
