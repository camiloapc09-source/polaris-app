import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { HeartPulse } from 'lucide-react'

export default async function AdminIncapacidadesPage() {
  const leaves = await prisma.leaveRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      employee: { include: { company: true } },
    },
  })

  const typeLabel: Record<string, string> = {
    SICK: 'Enfermedad General',
    DISABILITY: 'Incapacidad',
    MATERNITY: 'Licencia Maternidad',
    OTHER: 'Otro',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-navy">Incapacidades</h1>
        <p className="text-gray-500 mt-1">Solicitudes de todos los empleados</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-gray-500 text-sm">Total solicitudes</p>
          <p className="text-2xl font-bold text-brand-navy mt-1">{leaves.length}</p>
        </div>
        <div className="card border-l-4 border-yellow-400">
          <p className="text-gray-500 text-sm">En revisión</p>
          <p className="text-2xl font-bold text-brand-navy mt-1">{leaves.filter(l => l.status === 'PENDING').length}</p>
        </div>
        <div className="card border-l-4 border-green-400">
          <p className="text-gray-500 text-sm">Aprobadas</p>
          <p className="text-2xl font-bold text-brand-navy mt-1">{leaves.filter(l => l.status === 'APPROVED').length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {leaves.map((l) => (
          <div key={l.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                  <HeartPulse size={18} className="text-brand-orange" />
                </div>
                <div>
                  <p className="font-bold text-sm text-brand-navy">
                    {l.employee.firstName} {l.employee.lastName}
                    <span className="ml-2 text-xs text-gray-400 font-normal">· {l.employee.company.name}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {typeLabel[l.type]} · {l.days} días · {formatDate(l.startDate)} → {formatDate(l.endDate)}
                  </p>
                  {l.description && <p className="text-xs text-gray-400 mt-1">{l.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={
                  l.status === 'APPROVED' ? 'badge-active' :
                  l.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'
                }>
                  {l.status === 'APPROVED' ? 'Aprobada' : l.status === 'REJECTED' ? 'Rechazada' : 'En revisión'}
                </span>
                {l.status === 'PENDING' && (
                  <form action={`/api/leave-requests/${l.id}/review`} method="POST" className="flex gap-2">
                    <button name="action" value="APPROVED" className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-green-200 transition-colors">
                      Aprobar
                    </button>
                    <button name="action" value="REJECTED" className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-200 transition-colors">
                      Rechazar
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
