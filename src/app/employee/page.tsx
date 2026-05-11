import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCOP, formatDate } from '@/lib/utils'
import { FileText, HeartPulse, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default async function EmployeeDashboard() {
  const session = await auth()
  const user = session?.user as any
  const employeeId = user?.employeeId

  const [employee, recentPays, pendingLeaves] = await Promise.all([
    prisma.employee.findUnique({
      where: { id: employeeId },
      include: { company: true },
    }),
    prisma.payPeriod.findMany({
      where: { employeeId },
      orderBy: { periodEnd: 'desc' },
      take: 3,
    }),
    prisma.leaveRequest.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ])

  const lastPay = recentPays[0]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-navy">
          Hola, {employee?.firstName} 👋
        </h1>
        <p className="text-gray-500 mt-1">{employee?.position} · {employee?.company?.name}</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-brand-gradient text-white border-0">
          <p className="text-white/70 text-sm mb-1">Último pago neto</p>
          <p className="text-3xl font-bold">{lastPay ? formatCOP(lastPay.netPay) : '—'}</p>
          <p className="text-white/60 text-xs mt-1">{lastPay?.periodLabel || 'Sin pagos aún'}</p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm mb-1">Salario base</p>
          <p className="text-2xl font-bold text-brand-navy">{formatCOP(employee?.salary || 0)}</p>
          <p className="text-gray-400 text-xs mt-1">Mensual</p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm mb-1">Fecha de inicio</p>
          <p className="text-2xl font-bold text-brand-navy">
            {employee?.startDate ? formatDate(employee.startDate) : '—'}
          </p>
          <p className="text-gray-400 text-xs mt-1">Vinculación</p>
        </div>
      </div>

      {/* Recent pays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-brand-navy">Últimas Colillas</h3>
            <Link href="/employee/colillas" className="text-brand-purple text-sm hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {recentPays.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-purple/10 rounded-xl flex items-center justify-center">
                    <FileText size={16} className="text-brand-purple" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-navy">{p.periodLabel}</p>
                    <p className="text-xs text-gray-400">{p.status === 'PAID' ? 'Pagado' : 'Pendiente'}</p>
                  </div>
                </div>
                <p className="font-bold text-brand-purple">{formatCOP(p.netPay)}</p>
              </div>
            ))}
            {recentPays.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">Sin pagos registrados</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-brand-navy">Mis Incapacidades</h3>
            <Link href="/employee/incapacidades" className="text-brand-purple text-sm hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {pendingLeaves.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                    <HeartPulse size={16} className="text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-navy">{l.type}</p>
                    <p className="text-xs text-gray-400">{l.days} días · {formatDate(l.startDate)}</p>
                  </div>
                </div>
                <span className={
                  l.status === 'APPROVED' ? 'badge-active' :
                  l.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'
                }>
                  {l.status === 'APPROVED' ? 'Aprobada' : l.status === 'REJECTED' ? 'Rechazada' : 'Pendiente'}
                </span>
              </div>
            ))}
            {pendingLeaves.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm mb-3">No tienes incapacidades registradas</p>
                <Link href="/employee/incapacidades/nueva" className="btn-primary text-sm py-2 px-4">
                  Registrar incapacidad
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
