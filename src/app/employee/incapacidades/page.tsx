import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { HeartPulse, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function IncapacidadesPage() {
  const session = await auth()
  const user = session?.user as any

  const leaves = await prisma.leaveRequest.findMany({
    where: { employeeId: user?.employeeId },
    orderBy: { createdAt: 'desc' },
  })

  const typeLabel: Record<string, string> = {
    SICK: 'Enfermedad General',
    DISABILITY: 'Incapacidad',
    MATERNITY: 'Licencia Maternidad',
    OTHER: 'Otro',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Mis Incapacidades</h1>
          <p className="text-gray-500 mt-1">Gestiona tus solicitudes de incapacidad</p>
        </div>
        <Link href="/employee/incapacidades/nueva" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nueva solicitud
        </Link>
      </div>

      <div className="space-y-4">
        {leaves.map((l) => (
          <div key={l.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center">
                  <HeartPulse size={22} className="text-brand-orange" />
                </div>
                <div>
                  <p className="font-bold text-brand-navy">{typeLabel[l.type] || l.type}</p>
                  <p className="text-sm text-gray-400">
                    {formatDate(l.startDate)} → {formatDate(l.endDate)} · {l.days} días
                  </p>
                  {l.description && (
                    <p className="text-sm text-gray-500 mt-1">{l.description}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={
                  l.status === 'APPROVED' ? 'badge-active' :
                  l.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'
                }>
                  {l.status === 'APPROVED' ? 'Aprobada' : l.status === 'REJECTED' ? 'Rechazada' : 'En revisión'}
                </span>
                {l.reviewNote && (
                  <p className="text-xs text-gray-400 mt-2 max-w-48">{l.reviewNote}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {leaves.length === 0 && (
          <div className="card text-center py-12">
            <HeartPulse size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No tienes incapacidades registradas</p>
            <Link href="/employee/incapacidades/nueva" className="btn-primary">
              Registrar primera incapacidad
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
