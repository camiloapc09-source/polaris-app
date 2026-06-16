import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { Stethoscope, CalendarClock, CheckCircle2, ClipboardList, ExternalLink } from 'lucide-react'
import { AgendarCitaButton, RegistrarResultadoButton } from './ExamenActions'

const RESULT_INFO: Record<string, { label: string; bg: string; color: string }> = {
  APTO:                   { label: 'Apto',                   bg: '#DCFCE7', color: '#15803D' },
  APTO_CON_RESTRICCIONES: { label: 'Apto c/ restricciones',  bg: '#FEF9C3', color: '#A16207' },
  NO_APTO:                { label: 'No apto',                bg: '#FEE2E2', color: '#B91C1C' },
  PENDIENTE:              { label: 'Pend. resultado',        bg: '#F3F4F6', color: '#6B7280' },
}

const TYPE_LABEL: Record<string, string> = {
  INGRESO: 'Ingreso', PERIODICO: 'Periódico', EGRESO: 'Egreso',
}

function formatDateTime(d: Date) {
  return d.toLocaleString('es-CO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const STEP_INFO: Record<string, { label: string; bg: string; color: string; hint: string }> = {
  PROGRAMADO:    { label: 'Programado por Star Shine', bg: '#EDE9FE', color: '#4429A6', hint: 'Saca tu cita con la EPS y registra el día y la hora.' },
  CITA_AGENDADA: { label: 'Cita agendada',             bg: '#DBEAFE', color: '#1D4ED8', hint: 'Asiste a tu cita. Luego registra el resultado y sube tu historia clínica.' },
  REALIZADO:     { label: 'Examen realizado',          bg: '#DCFCE7', color: '#15803D', hint: 'Examen completado. Sin acciones pendientes.' },
}

export default async function EmployeeExamenesPage() {
  const session = await auth()
  const user = session?.user as any
  const employeeId = user?.employeeId

  const examenes = employeeId
    ? await prisma.examenMedico.findMany({
        where: { employeeId },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      })
    : []

  const pendientes = examenes.filter((e) => e.status !== 'REALIZADO').length

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ color: '#0F1026', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
          Mis Exámenes Médicos
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
          Agenda tus citas y registra tus resultados
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)', borderRadius: 16, padding: 24, color: 'white' }}>
          <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Total exámenes</p>
          <p style={{ fontSize: 32, fontWeight: 800 }}>{examenes.length}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Acciones pendientes</p>
          <p style={{ color: pendientes > 0 ? '#F2421B' : '#0F1026', fontSize: 32, fontWeight: 800 }}>{pendientes}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Realizados</p>
          <p style={{ color: '#0F1026', fontSize: 32, fontWeight: 800 }}>{examenes.filter((e) => e.status === 'REALIZADO').length}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {examenes.map((ex) => {
          const step = STEP_INFO[ex.status] || STEP_INFO.PROGRAMADO
          const ri = RESULT_INFO[ex.result] || RESULT_INFO.PENDIENTE

          return (
            <div key={ex.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: step.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Stethoscope size={20} color={step.color} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#0F1026' }}>Examen {TYPE_LABEL[ex.type] || ex.type}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: step.bg, color: step.color, marginTop: 4 }}>
                      {step.label}
                    </span>
                    <p style={{ fontSize: 12, color: '#888', marginTop: 8, maxWidth: 380 }}>{step.hint}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                  {ex.status === 'PROGRAMADO' && <AgendarCitaButton examen={{ id: ex.id, status: ex.status, clinic: ex.clinic }} />}
                  {ex.status === 'CITA_AGENDADA' && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <AgendarCitaButton examen={{ id: ex.id, status: ex.status, clinic: ex.clinic }} />
                      <RegistrarResultadoButton examen={{ id: ex.id, status: ex.status, clinic: ex.clinic }} />
                    </div>
                  )}
                  {ex.status === 'REALIZADO' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: ri.bg, color: ri.color }}>
                      {ri.label}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ padding: '0 24px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ex.notes && ex.status === 'PROGRAMADO' && (
                  <div style={{ background: '#F8F8FB', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <ClipboardList size={14} color="#4429A6" style={{ marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: '#555' }}>{ex.notes}</p>
                  </div>
                )}
                {ex.appointmentAt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8F8FB', borderRadius: 10, padding: '10px 14px' }}>
                    <CalendarClock size={14} color="#1D4ED8" />
                    <p style={{ fontSize: 12, color: '#0F1026', fontWeight: 600, textTransform: 'capitalize' }}>
                      {formatDateTime(ex.appointmentAt)}
                    </p>
                    {ex.clinic && <span style={{ fontSize: 12, color: '#A2A2A2' }}>· {ex.clinic}</span>}
                  </div>
                )}
                {ex.status === 'REALIZADO' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F0FDF4', borderRadius: 10, padding: '10px 14px', flexWrap: 'wrap' }}>
                    <CheckCircle2 size={14} color="#15803D" />
                    <span style={{ fontSize: 12, color: '#0F1026', fontWeight: 600 }}>
                      Realizado{ex.examDate ? ` el ${formatDate(ex.examDate)}` : ''}
                    </span>
                    {ex.evidenceUrl && (
                      <a href={ex.evidenceUrl} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#4429A6', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                        <ExternalLink size={13} /> Ver historia clínica
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {examenes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', color: '#BBBBBB', fontSize: 14 }}>
            No tienes exámenes médicos programados aún.
          </div>
        )}
      </div>
    </div>
  )
}
