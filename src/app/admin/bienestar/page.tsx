import { prisma } from '@/lib/db'
import { NuevoProgramaForm } from './NuevoProgramaForm'
import { toggleProgramaStatus } from '@/app/actions/bienestar'
import { Heart, Users, Activity, Brain, CalendarClock, MapPin } from 'lucide-react'

function formatDateTime(d: Date) {
  return d.toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const CATEGORY_INFO: Record<string, { label: string; icon: any; bg: string; color: string }> = {
  PSICOLOGIA:       { label: 'Psicología',       icon: Brain,    bg: '#EDE9FE', color: '#4429A6' },
  ACTIVIDAD_FISICA: { label: 'Actividad física', icon: Activity, bg: '#DCFCE7', color: '#15803D' },
  NUTRICION:        { label: 'Nutrición',         icon: Heart,   bg: '#FEF9C3', color: '#A16207' },
  OTRO:             { label: 'Otro',              icon: Heart,   bg: '#F3F4F6', color: '#6B7280' },
}

export default async function AdminBienestarPage() {
  const [companies, programas] = await Promise.all([
    prisma.company.findMany({ orderBy: { name: 'asc' } }),
    prisma.programaBienestar.findMany({
      include: {
        company: true,
        inscripciones: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const active = programas.filter((p) => p.isActive).length
  const totalInscrip = programas.reduce((s, p) => s + p.inscripciones.length, 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
            Star Shine · Polaris
          </p>
          <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Bienestar
          </h1>
          <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>Programas de bienestar para empleados</p>
        </div>
        <NuevoProgramaForm companies={companies} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)', borderRadius: 16, padding: 24, color: 'white' }}>
          <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Total programas</p>
          <p style={{ fontSize: 32, fontWeight: 800 }}>{programas.length}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Activos</p>
          <p style={{ color: '#0F1026', fontSize: 32, fontWeight: 800 }}>{active}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Inscripciones totales</p>
          <p style={{ color: '#0F1026', fontSize: 32, fontWeight: 800 }}>{totalInscrip}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {programas.map((prog) => {
          const info = CATEGORY_INFO[prog.category] || CATEGORY_INFO.OTRO
          const Icon = info.icon
          return (
            <div
              key={prog.id}
              style={{
                background: 'white', borderRadius: 16,
                border: `1px solid ${prog.isActive ? '#EFEFEF' : '#F0F0F0'}`,
                padding: 24, opacity: prog.isActive ? 1 : 0.65,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: info.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={info.color} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#0F1026' }}>{prog.title}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600, background: info.bg, color: info.color, marginTop: 3 }}>
                      {info.label}
                    </span>
                  </div>
                </div>
                <form action={async () => {
                  'use server'
                  await toggleProgramaStatus(prog.id, prog.isActive)
                }}>
                  <button type="submit" style={{
                    background: prog.isActive ? '#FEE2E2' : '#DCFCE7',
                    color: prog.isActive ? '#B91C1C' : '#15803D',
                    border: 'none', borderRadius: 8, padding: '5px 12px',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  }}>
                    {prog.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                </form>
              </div>

              {prog.description && (
                <p style={{ fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 1.5 }}>{prog.description}</p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {prog.provider && (
                  <p style={{ fontSize: 12, color: '#A2A2A2' }}>
                    Proveedor: <span style={{ color: '#0F1026', fontWeight: 600 }}>{prog.provider}</span>
                  </p>
                )}
                {prog.eventDate && (
                  <p style={{ fontSize: 12, color: '#A2A2A2', display: 'flex', alignItems: 'center', gap: 5 }}>
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
                <p style={{ fontSize: 12, color: '#A2A2A2' }}>
                  Cliente: <span style={{ color: '#0F1026', fontWeight: 600 }}>{prog.company.name}</span>
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid #F0F0F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={14} color="#A2A2A2" />
                  <span style={{ fontSize: 12, color: '#888' }}>
                    {prog.inscripciones.length} confirmados
                    {prog.capacity ? ` / ${prog.capacity} cupos` : ''}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {programas.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', color: '#BBBBBB', fontSize: 14 }}>
            No hay programas de bienestar creados aún
          </div>
        )}
      </div>
    </div>
  )
}
