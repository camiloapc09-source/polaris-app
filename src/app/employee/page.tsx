import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCOP, formatDate } from '@/lib/utils'
import { FileText, HeartPulse } from 'lucide-react'
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
      <div style={{ marginBottom: 36 }}>
        <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Portal de Empleado · Polaris
        </p>
        <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
          Hola, {employee?.firstName}
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
          {employee?.position} · {employee?.company?.name}
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)', borderRadius: 16, padding: 24, color: 'white' }}>
          <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Último pago neto</p>
          <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{lastPay ? formatCOP(lastPay.netPay) : '—'}</p>
          <p style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>{lastPay?.periodLabel || 'Sin pagos aún'}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Salario base</p>
          <p style={{ color: '#0F1026', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{formatCOP(employee?.salary || 0)}</p>
          <p style={{ color: '#BBBBBB', fontSize: 11, marginTop: 6 }}>Mensual</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Fecha de inicio</p>
          <p style={{ color: '#0F1026', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {employee?.startDate ? formatDate(employee.startDate) : '—'}
          </p>
          <p style={{ color: '#BBBBBB', fontSize: 11, marginTop: 6 }}>Vinculación</p>
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
