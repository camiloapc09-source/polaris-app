import { prisma } from '@/lib/db'
import { StatCard } from '@/components/dashboard/StatCard'
import { formatCOP } from '@/lib/utils'
import { DollarSign, Users, TrendingUp, FileText } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [
    totalIncomes,
    totalPayroll,
    totalService,
    totalContribs,
    employeeCount,
    pendingLeaves,
    recentPayPeriods,
  ] = await Promise.all([
    prisma.income.aggregate({ _sum: { amountCOP: true } }),
    prisma.payPeriod.aggregate({ _sum: { netPay: true } }),
    prisma.serviceInvoice.aggregate({ _sum: { total: true } }),
    prisma.socialContribution.aggregate({ _sum: { total: true } }),
    prisma.employee.count({ where: { status: 'ACTIVE' } }),
    prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
    prisma.payPeriod.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { employee: { select: { firstName: true, lastName: true } } },
    }),
  ])

  const totalIn = totalIncomes._sum.amountCOP || 0
  const totalOut = (totalPayroll._sum.netPay || 0) + (totalService._sum.total || 0) + (totalContribs._sum.total || 0)
  const balance = totalIn - totalOut

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Star Shine · Polaris
        </p>
        <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
          Dashboard
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
          Resumen financiero y operacional
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard
          title="Saldo Disponible"
          value={formatCOP(balance)}
          subtitle="Total ingresos - egresos"
          accent={true}
        />
        <StatCard
          title="Total Ingresos"
          value={formatCOP(totalIn)}
          subtitle="Pagos recibidos de Kover"
        />
        <StatCard
          title="Empleados Activos"
          value={employeeCount.toString()}
          subtitle="En Colombia"
        />
        <StatCard
          title="Incapacidades Pendientes"
          value={pendingLeaves.toString()}
          subtitle="Requieren revisión"
        />
      </div>

      {/* Financial breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <h3 style={{ color: '#0F1026', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Distribución de Egresos</h3>
          <div className="space-y-3">
            {[
              { label: 'Nómina', value: totalPayroll._sum.netPay || 0, color: 'bg-brand-purple' },
              { label: 'Aportes Sociales', value: totalContribs._sum.total || 0, color: 'bg-brand-purple-light' },
              { label: 'Servicio Star Shine', value: totalService._sum.total || 0, color: 'bg-brand-orange' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-semibold">{formatCOP(item.value)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: totalOut > 0 ? `${(item.value / totalOut) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ color: '#0F1026', fontWeight: 700, fontSize: 15 }}>Últimas Nóminas</h3>
            <Link href="/admin/nomina" className="text-brand-purple text-sm font-medium hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {recentPayPeriods.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-sm text-brand-navy">
                    {p.employee.firstName} {p.employee.lastName}
                  </p>
                  <p className="text-xs text-gray-400">{p.periodLabel}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-purple">{formatCOP(p.netPay)}</p>
                  <span className={p.status === 'PAID' ? 'badge-paid' : 'badge-pending'}>
                    {p.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {[
          { href: '/admin/nomina',         label: 'Registrar Pago',      icon: DollarSign },
          { href: '/admin/ingresos',        label: 'Nuevo Ingreso',       icon: TrendingUp },
          { href: '/admin/empleados',       label: 'Gestionar Empleados', icon: Users },
          { href: '/admin/incapacidades',   label: 'Ver Incapacidades',   icon: FileText },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="border border-[#EFEFEF] hover:border-[#4429A6] hover:shadow-[0_0_0_1px_#4429A6] transition-[border-color,box-shadow] duration-150"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: 'white', borderRadius: 16, padding: '24px 16px',
                textDecoration: 'none', gap: 12,
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(68,41,166,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color="#4429A6" />
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0F1026', textAlign: 'center' }}>{item.label}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
