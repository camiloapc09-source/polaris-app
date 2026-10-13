import { CalendarClock, ExternalLink, MapPin } from 'lucide-react'
import { CITA_STATUS_INFO, CITA_TYPE_LABEL, formatCitaDateTime, formatDuration } from '@/lib/citas'
import { formatDate } from '@/lib/utils'

type Cita = {
  type: string
  appointmentAt: Date
  durationHours: number | null
  place: string | null
  reason: string | null
  documentUrl: string | null
  status: string
  adminNote: string | null
  createdAt: Date
}

// Tarjeta de una cita médica. `employeeLine` se muestra en las vistas de
// admin y cliente; `actions` es el espacio para botones según el rol.
export function CitaCard({ cita, employeeLine, actions }: {
  cita: Cita
  employeeLine?: string
  actions?: React.ReactNode
}) {
  const st = CITA_STATUS_INFO[cita.status] || CITA_STATUS_INFO.PENDING
  const duration = formatDuration(cita.durationHours)

  return (
    <div style={{
      background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', padding: '20px 24px',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
      opacity: cita.status === 'CANCELLED' ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, minWidth: 0, flex: '1 1 260px' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: '#F0EDFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <CalendarClock size={20} color="#4429A6" />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#0F1026' }}>
            {CITA_TYPE_LABEL[cita.type] || cita.type}
          </p>
          {employeeLine && (
            <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{employeeLine}</p>
          )}
          <p style={{ fontSize: 13, color: '#0F1026', marginTop: 4, fontWeight: 600 }}>
            {formatCitaDateTime(cita.appointmentAt)}
            {duration && <span style={{ color: '#A2A2A2', fontWeight: 500 }}> · {duration}</span>}
          </p>
          {cita.place && (
            <p style={{ fontSize: 12, color: '#888', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} /> {cita.place}
            </p>
          )}
          {cita.reason && (
            <p style={{ fontSize: 12, color: '#888', marginTop: 4, fontStyle: 'italic' }}>&ldquo;{cita.reason}&rdquo;</p>
          )}
          {cita.adminNote && (
            <p style={{ fontSize: 12, color: '#4429A6', marginTop: 4 }}>Star Shine: {cita.adminNote}</p>
          )}
          <p style={{ fontSize: 11, color: '#BBBBBB', marginTop: 6 }}>Solicitada el {formatDate(cita.createdAt)}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>
          {st.label}
        </span>
        {cita.documentUrl && (
          <a href={cita.documentUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#4429A6', fontWeight: 600, textDecoration: 'none' }}>
            <ExternalLink size={13} /> Ver soporte
          </a>
        )}
        {actions}
      </div>
    </div>
  )
}

export function CitasStats({ items }: { items: { label: string; value: number; color?: string }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 32 }}>
      {items.map((it, i) => (
        <div key={it.label} style={i === 0
          ? { background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)', borderRadius: 16, padding: 20, color: 'white' }
          : { background: 'white', borderRadius: 16, padding: 20, border: '1px solid #EFEFEF' }}>
          <p style={{ fontSize: 11, marginBottom: 6, fontWeight: 500, ...(i === 0 ? { opacity: 0.75 } : { color: '#A2A2A2' }) }}>{it.label}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: i === 0 ? 'white' : (it.color || '#0F1026') }}>{it.value}</p>
        </div>
      ))}
    </div>
  )
}

export function CitasEmpty({ text }: { text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #EFEFEF' }}>
      <CalendarClock size={32} style={{ color: '#D0D0D0', margin: '0 auto 12px' }} />
      <p style={{ color: '#BBBBBB', fontSize: 14 }}>{text}</p>
    </div>
  )
}
