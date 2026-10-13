// Etiquetas y formato compartidos por las vistas de Citas Médicas
// (empleado, admin y cliente).

export const CITA_TYPE_LABEL: Record<string, string> = {
  GENERAL:      'Medicina general',
  ESPECIALISTA: 'Especialista',
  ODONTOLOGIA:  'Odontología',
  EXAMENES:     'Exámenes / laboratorio',
  TERAPIA:      'Terapia',
  OTRO:         'Otro',
}

export const CITA_STATUS_INFO: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:   { label: 'Pendiente',  bg: '#FEF9C3', color: '#A16207' },
  APPROVED:  { label: 'Aprobada',   bg: '#DCFCE7', color: '#15803D' },
  REJECTED:  { label: 'Rechazada',  bg: '#FEE2E2', color: '#B91C1C' },
  CANCELLED: { label: 'Cancelada',  bg: '#F3F4F6', color: '#6B7280' },
}

export function formatCitaDateTime(d: Date | string) {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZone: 'America/Bogota',
  }).format(new Date(d))
}

export function formatDuration(hours: number | null) {
  if (!hours) return null
  if (hours < 1) return `${Math.round(hours * 60)} min`
  return `${hours.toLocaleString('es-CO')} h`
}
