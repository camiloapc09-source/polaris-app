import { prisma } from '@/lib/db'
import { formatCOP, formatDate } from '@/lib/utils'
import { DollarSign, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function NominaAdminPage() {
  const payPeriods = await prisma.payPeriod.findMany({
    orderBy: { periodEnd: 'desc' },
    include: {
      employee: {
        include: { company: true },
      },
    },
  })

  const totalPaid = payPeriods.filter(p => p.status === 'PAID').reduce((s, p) => s + p.netPay, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Nómina</h1>
          <p className="text-gray-500 mt-1">Gestión de pagos a empleados</p>
        </div>
        <Link href="/admin/nomina/nuevo" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Registrar pago
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card bg-brand-gradient text-white border-0">
          <p className="text-white/70 text-sm">Total pagado</p>
          <p className="text-2xl font-bold mt-1">{formatCOP(totalPaid)}</p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">Pagos realizados</p>
          <p className="text-2xl font-bold text-brand-navy mt-1">{payPeriods.filter(p => p.status === 'PAID').length}</p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">Pendientes</p>
          <p className="text-2xl font-bold text-brand-navy mt-1">{payPeriods.filter(p => p.status !== 'PAID').length}</p>
        </div>
      </div>

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase">Empleado</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase">Periodo</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase">Detalles</th>
              <th className="text-right py-3 px-4 text-xs font-bold text-gray-400 uppercase">Neto</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-gray-400 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody>
            {payPeriods.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">
                  <p className="font-semibold text-sm text-brand-navy">{p.employee.firstName} {p.employee.lastName}</p>
                  <p className="text-xs text-gray-400">{p.employee.company.name}</p>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm font-medium">{p.periodLabel}</p>
                  {p.paidAt && <p className="text-xs text-gray-400">Pagado: {formatDate(p.paidAt)}</p>}
                </td>
                <td className="py-4 px-4 text-xs text-gray-500 space-y-1">
                  <p>Base: {formatCOP(p.baseSalary)}</p>
                  {p.conectividad > 0 && <p>Conectividad: {formatCOP(p.conectividad)}</p>}
                  {p.tools > 0 && <p>Herramientas: {formatCOP(p.tools)}</p>}
                </td>
                <td className="py-4 px-4 text-right">
                  <p className="font-bold text-brand-purple">{formatCOP(p.netPay)}</p>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={p.status === 'PAID' ? 'badge-paid' : 'badge-pending'}>
                    {p.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
