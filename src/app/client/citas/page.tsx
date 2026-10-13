import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { CitaCard, CitasEmpty, CitasStats } from '@/components/citas/CitaCard'

export default async function ClientCitasPage() {
  const session = await auth()
  const user = session?.user as any
  const companyId = user?.companyId
  if (user?.role !== 'CLIENT' || !companyId) redirect('/')

  // Sólo lectura: el cliente ve las citas de sus empleados; la aprobación es de Star Shine.
  // Las canceladas por el propio empleado no se muestran.
  const citas = await prisma.citaMedica.findMany({
    where: { employee: { companyId }, status: { not: 'CANCELLED' } },
    orderBy: { appointmentAt: 'desc' },
    include: { employee: true },
  })

  const now = new Date()
  const upcoming = citas.filter((c) => c.appointmentAt >= now && c.status !== 'REJECTED').length

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ color: '#0F1026', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
          Citas Médicas
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
          Citas que reportó tu equipo. Star Shine gestiona la aprobación.
        </p>
      </div>

      <CitasStats items={[
        { label: 'Solicitudes', value: citas.length },
        { label: 'Próximas', value: upcoming, color: '#1D4ED8' },
        { label: 'En revisión', value: citas.filter((c) => c.status === 'PENDING').length, color: '#A16207' },
        { label: 'Aprobadas', value: citas.filter((c) => c.status === 'APPROVED').length, color: '#15803D' },
      ]} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {citas.length === 0 && <CitasEmpty text="Tu equipo no ha reportado citas médicas" />}
        {citas.map((cita) => (
          <CitaCard
            key={cita.id}
            cita={cita}
            employeeLine={`${cita.employee.firstName} ${cita.employee.lastName} · ${cita.employee.position}`}
          />
        ))}
      </div>
    </div>
  )
}
