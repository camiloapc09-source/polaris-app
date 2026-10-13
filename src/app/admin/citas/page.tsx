import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { CitaCard, CitasEmpty, CitasStats } from '@/components/citas/CitaCard'
import { CitaReviewPanel } from './CitaReviewPanel'

export default async function AdminCitasPage() {
  const session = await auth()
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/')

  const citas = await prisma.citaMedica.findMany({
    orderBy: { appointmentAt: 'desc' },
    include: { employee: { include: { company: true } } },
  })

  // Pendientes primero para que lo que requiere acción quede arriba
  const sorted = [
    ...citas.filter((c) => c.status === 'PENDING'),
    ...citas.filter((c) => c.status !== 'PENDING'),
  ]

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Star Shine · Polaris
        </p>
        <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
          Citas Médicas
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>Permisos por citas que reportan los empleados</p>
      </div>

      <CitasStats items={[
        { label: 'Total solicitudes', value: citas.length },
        { label: 'Por aprobar', value: citas.filter((c) => c.status === 'PENDING').length, color: '#A16207' },
        { label: 'Aprobadas', value: citas.filter((c) => c.status === 'APPROVED').length, color: '#15803D' },
        { label: 'Rechazadas', value: citas.filter((c) => c.status === 'REJECTED').length, color: '#B91C1C' },
      ]} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {citas.length === 0 && <CitasEmpty text="No hay solicitudes de citas médicas" />}
        {sorted.map((cita) => (
          <CitaCard
            key={cita.id}
            cita={cita}
            employeeLine={`${cita.employee.firstName} ${cita.employee.lastName} · ${cita.employee.company.name}`}
            actions={<CitaReviewPanel id={cita.id} status={cita.status} adminNote={cita.adminNote} />}
          />
        ))}
      </div>
    </div>
  )
}
