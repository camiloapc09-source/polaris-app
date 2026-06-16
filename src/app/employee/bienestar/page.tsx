import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { toggleInscripcion } from '@/app/actions/bienestar'
import { Heart, Users, Activity, Brain, CheckCircle2, CalendarClock, MapPin } from 'lucide-react'

function formatDateTime(d: Date) {
  return d.toLocaleString('es-CO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const CATEGORY_INFO: Record<string, { label: string; icon: any; bg: string; color: string }> = {
  PSICOLOGIA:       { label: 'Psicología',       icon: Brain,    bg: '#EDE9FE', color: '#4429A6' },
  ACTIVIDAD_FISICA: { label: 'Actividad física', icon: Activity, bg: '#DCFCE7', color: '#15803D' },
  NUTRICION:        { label: 'Nutrición',         icon: Heart,   bg: '#FEF9C3', color: '#A16207' },
  OTRO:             { label: 'Otro',              icon: Heart,   bg: '#F3F4F6', color: '#6B7280' },
}

export default async function EmployeeBienestarPage() {
  const session = await auth()
  const user = session?.user as any
  const employeeId = user?.employeeId

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { companyId: true },
  })

  const programas = await prisma.programaBienestar.findMany({
    where: { companyId: employee?.companyId, isActive: true },
    include: {
      inscripciones: { where: { employeeId } },
      _count: { select: { inscripciones: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const inscritoCount = programas.filter((p) => p.inscripciones.length > 0).length

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ color: '#0F1026', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
          Bienestar
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
          Beneficios disponibles para ti
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)', borderRadius: 16, padding: 24, color: 'white' }}>
          <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Programas disponibles</p>
          <p style={{ fontSize: 32, fontWeight: 800 }}>{programas.length}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Asistencias confirmadas</p>
          <p style={{ color: '#0F1026', fontSize: 32, fontWeight: 800 }}>{inscritoCount}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Por confirmar</p>
          <p style={{ color: '#0F1026', fontSize: 32, fontWeight: 800 }}>{programas.length - inscritoCount}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {programas.map((prog) => {
          const info = CATEGORY_INFO[prog.category] || CATEGORY_INFO.OTRO
          const Icon = info.icon
          const inscrito = prog.inscripciones.length > 0
          const lleno = prog.capacity !== null && prog._count.inscripciones >= prog.capacity && !inscrito

          return (
            <div
              key={prog.id}
              style={{
                background: 'white', borderRadius: 16,
                border: inscrito ? '2px solid #4429A6' : '1px solid #EFEFEF',
                padding: 24,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: info.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} color={info.color} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#0F1026' }}>{prog.title}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600, background: info.bg, color: info.color, marginTop: 3 }}>
                      {info.label}
                    </span>
                  </div>
                </div>
                {inscrito && (
                  <CheckCircle2 size={20} color="#4429A6" />
                )}
              </div>

              {prog.description && (
                <p style={{ fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 1.5 }}>{prog.description}</p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                {prog.provider && (
                  <p style={{ fontSize: 12, color: '#A2A2A2' }}>
                    Proveedor: <span style={{ color: '#0F1026', fontWeight: 600 }}>{prog.provider}</span>
                  </p>
                )}
                {prog.eventDate && (
                  <p style={{ fontSize: 12, color: '#A2A2A2', display: 'flex', alignItems: 'center', gap: 5, textTransform: 'capitalize' }}>
                    <CalendarClock size={12} color="#4429A6" />
                    <span style={{ color: '#0F1026', fontWeight: 600 }}>{formatDateTime(prog.eventDate)}</span>
                  </p>
                )}
                {prog.location && (
                  <p style={{ fontSize: 12, color: '#A2A2A2', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={12} color="#4429A6" />
                    <span style={{ color: '#0F1026', fontWeight: 600 }}>{prog.location}</span>
                  </p>
                )}
                <p style={{ fontSize: 12, color: '#A2A2A2', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={12} />
                  {prog._count.inscripciones} confirmados
                  {prog.capacity ? ` de ${prog.capacity}` : ''}
                </p>
              </div>

              <form action={async () => {
                'use server'
                await toggleInscripcion(prog.id)
              }}>
                <button
                  type="submit"
                  disabled={lleno}
                  style={{
                    width: '100%', border: 'none', borderRadius: 12, padding: '11px',
                    fontSize: 13, fontWeight: 600, cursor: lleno ? 'not-allowed' : 'pointer',
                    background: inscrito ? '#FEE2E2' : lleno ? '#F3F4F6' : '#4429A6',
                    color: inscrito ? '#B91C1C' : lleno ? '#9CA3AF' : 'white',
                    transition: 'all 0.15s',
                  }}
                >
                  {inscrito ? 'Cancelar asistencia' : lleno ? 'Sin cupos' : 'Confirmar asistencia'}
                </button>
              </form>
            </div>
          )
        })}

        {programas.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #EFEFEF' }}>
            <Heart size={32} style={{ color: '#D0D0D0', margin: '0 auto 12px' }} />
            <p style={{ color: '#BBBBBB', fontSize: 14 }}>No hay programas disponibles aún</p>
          </div>
        )}
      </div>
    </div>
  )
}
