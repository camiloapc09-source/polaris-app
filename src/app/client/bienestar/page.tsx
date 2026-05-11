import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Heart, Users, Activity, Brain } from 'lucide-react'

const CATEGORY_INFO: Record<string, { label: string; icon: any; bg: string; color: string }> = {
  PSICOLOGIA:       { label: 'Psicología',       icon: Brain,    bg: '#EDE9FE', color: '#4429A6' },
  ACTIVIDAD_FISICA: { label: 'Actividad física', icon: Activity, bg: '#DCFCE7', color: '#15803D' },
  NUTRICION:        { label: 'Nutrición',         icon: Heart,   bg: '#FEF9C3', color: '#A16207' },
  OTRO:             { label: 'Otro',              icon: Heart,   bg: '#F3F4F6', color: '#6B7280' },
}

export default async function ClientBienestarPage() {
  const session = await auth()
  const user = session?.user as any
  const companyId = user?.companyId

  const programas = await prisma.programaBienestar.findMany({
    where: { companyId },
    include: {
      inscripciones: {
        include: { employee: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalInscrip = programas.reduce((s, p) => s + p.inscripciones.length, 0)
  const active = programas.filter((p) => p.isActive).length

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ color: '#0F1026', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
          Bienestar
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
          Programas de bienestar disponibles para tu equipo
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #F2421B 100%)', borderRadius: 16, padding: 24, color: 'white' }}>
          <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Programas disponibles</p>
          <p style={{ fontSize: 32, fontWeight: 800 }}>{active}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Inscripciones activas</p>
          <p style={{ color: '#0F1026', fontSize: 32, fontWeight: 800 }}>{totalInscrip}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Total programas</p>
          <p style={{ color: '#0F1026', fontSize: 32, fontWeight: 800 }}>{programas.length}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {programas.map((prog) => {
          const info = CATEGORY_INFO[prog.category] || CATEGORY_INFO.OTRO
          const Icon = info.icon
          return (
            <div key={prog.id} style={{
              background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', overflow: 'hidden',
              opacity: prog.isActive ? 1 : 0.6,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: info.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={22} color={info.color} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#0F1026' }}>{prog.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600, background: info.bg, color: info.color }}>
                        {info.label}
                      </span>
                      {!prog.isActive && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600, background: '#F3F4F6', color: '#6B7280' }}>
                          Inactivo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8F8FB', borderRadius: 10, padding: '8px 14px' }}>
                  <Users size={14} color="#4429A6" />
                  <span style={{ fontSize: 13, color: '#4429A6', fontWeight: 700 }}>
                    {prog.inscripciones.length}
                    {prog.capacity ? `/${prog.capacity}` : ''} inscritos
                  </span>
                </div>
              </div>

              {prog.description && (
                <p style={{ fontSize: 13, color: '#888', padding: '0 24px 12px', lineHeight: 1.6 }}>{prog.description}</p>
              )}

              {(prog.provider || prog.schedule) && (
                <div style={{ padding: '12px 24px', borderTop: '1px solid #F8F8F8', background: '#FAFAFA', display: 'flex', gap: 24 }}>
                  {prog.provider && (
                    <p style={{ fontSize: 12, color: '#A2A2A2' }}>
                      Proveedor: <span style={{ color: '#0F1026', fontWeight: 600 }}>{prog.provider}</span>
                    </p>
                  )}
                  {prog.schedule && (
                    <p style={{ fontSize: 12, color: '#A2A2A2' }}>
                      Horario: <span style={{ color: '#0F1026', fontWeight: 600 }}>{prog.schedule}</span>
                    </p>
                  )}
                </div>
              )}

              {prog.inscripciones.length > 0 && (
                <div style={{ padding: '12px 24px 16px', borderTop: '1px solid #F0F0F0' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#A2A2A2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                    Empleados inscritos
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {prog.inscripciones.map((ins) => (
                      <div key={ins.id} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: '#F4F4F7', borderRadius: 8, padding: '5px 12px',
                      }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#4429A6,#F2421B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>
                            {ins.employee.firstName.charAt(0)}{ins.employee.lastName.charAt(0)}
                          </span>
                        </div>
                        <span style={{ fontSize: 12, color: '#0F1026', fontWeight: 500 }}>
                          {ins.employee.firstName} {ins.employee.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {programas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', color: '#BBBBBB', fontSize: 14 }}>
            Aún no hay programas de bienestar. Contacta a Star Shine para configurarlos.
          </div>
        )}
      </div>
    </div>
  )
}
