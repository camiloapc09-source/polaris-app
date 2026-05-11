import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCOP, formatDate } from '@/lib/utils'
import { Users, Receipt, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default async function ClientDashboard() {
  const session = await auth()
  const user = session?.user as any
  const companyId = user?.companyId

  const [company, employees, invoices] = await Promise.all([
    prisma.company.findUnique({ where: { id: companyId } }),
    prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      include: {
        payPeriods: { orderBy: { periodEnd: 'desc' }, take: 1 },
      },
    }),
    prisma.serviceInvoice.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-navy">{company?.name}</h1>
        <p className="text-gray-500 mt-1">Portal de cliente · Star Shine EOR</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-brand-gradient text-white border-0">
          <Users className="mb-3 text-white/80" size={24} />
          <p className="text-4xl font-bold">{employees.length}</p>
          <p className="text-white/70 text-sm mt-1">Empleados activos en Colombia</p>
        </div>
        <div className="card">
          <Receipt className="mb-3 text-brand-purple" size={24} />
          <p className="text-4xl font-bold text-brand-navy">{invoices.filter(i => i.status === 'PAID').length}</p>
          <p className="text-gray-500 text-sm mt-1">Facturas pagadas</p>
        </div>
        <div className="card">
          <CheckCircle className="mb-3 text-green-500" size={24} />
          <p className="text-4xl font-bold text-brand-navy">{invoices.filter(i => i.status === 'PENDING').length}</p>
          <p className="text-gray-500 text-sm mt-1">Facturas pendientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employees */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-brand-navy">Tus Empleados</h3>
            <Link href="/client/empleados" className="text-brand-purple text-sm hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-4">
            {employees.map((emp) => {
              const lastPay = emp.payPeriods[0]
              return (
                <div key={emp.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 bg-brand-gradient rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-brand-navy">{emp.firstName} {emp.lastName}</p>
                    <p className="text-xs text-gray-400">{emp.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Último pago</p>
                    <p className="text-sm font-bold text-brand-purple">
                      {lastPay ? formatCOP(lastPay.netPay) : '—'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Invoices */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-brand-navy">Facturas de Servicio</h3>
            <Link href="/client/facturas" className="text-brand-purple text-sm hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-brand-navy">{inv.period}</p>
                  {inv.iva > 0 && <p className="text-xs text-gray-400">Incluye IVA 19%</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-purple">{formatCOP(inv.total)}</p>
                  <span className={inv.status === 'PAID' ? 'badge-paid' : 'badge-pending'}>
                    {inv.status === 'PAID' ? 'Pagada' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
