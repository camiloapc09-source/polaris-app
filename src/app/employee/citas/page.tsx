import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { CitaCard, CitasEmpty } from '@/components/citas/CitaCard'
import { NuevaCitaForm, CancelarCitaButton } from './NuevaCitaForm'

export default async function EmployeeCitasPage() {
  const session = await auth()
  const user = session?.user as any
  const employeeId = user?.employeeId
  if (!employeeId) redirect('/')

  const citas = await prisma.citaMedica.findMany({
    where: { employeeId },
    orderBy: { appointmentAt: 'desc' },
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 36 }}>
        <div>
          <h1 style={{ color: '#0F1026', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Mis Citas Médicas
          </h1>
          <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
            Reporta tus citas para que Star Shine apruebe el permiso
          </p>
        </div>
        <NuevaCitaForm />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {citas.length === 0 && <CitasEmpty text="Aún no has reportado citas médicas" />}
        {citas.map((cita) => (
          <CitaCard
            key={cita.id}
            cita={cita}
            actions={cita.status === 'PENDING' ? <CancelarCitaButton id={cita.id} /> : undefined}
          />
        ))}
      </div>
    </div>
  )
}
