import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCOP, formatDate } from '@/lib/utils'
import { FileText, Download } from 'lucide-react'
import Link from 'next/link'

export default async function ColillasPage() {
  const session = await auth()
  const user = session?.user as any

  const payPeriods = await prisma.payPeriod.findMany({
    where: { employeeId: user?.employeeId },
    orderBy: { periodEnd: 'desc' },
    include: {
      employee: { include: { company: true } },
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-navy">Mis Colillas de Pago</h1>
        <p className="text-gray-500 mt-1">Historial completo de pagos y descargables</p>
      </div>

      <div className="space-y-4">
        {payPeriods.map((p) => (
          <div key={p.id} className="card hover:border-brand-purple transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-purple/10 rounded-2xl flex items-center justify-center">
                  <FileText size={22} className="text-brand-purple" />
                </div>
                <div>
                  <p className="font-bold text-brand-navy">{p.periodLabel}</p>
                  <p className="text-sm text-gray-400">
                    {formatDate(p.periodStart)} — {formatDate(p.periodEnd)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                  <p className="text-xs text-gray-400">Salario base</p>
                  <p className="font-semibold text-brand-navy">{formatCOP(p.baseSalary)}</p>
                </div>
                {p.conectividad > 0 && (
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-gray-400">Conectividad</p>
                    <p className="font-semibold text-brand-navy">{formatCOP(p.conectividad)}</p>
                  </div>
                )}
                <div className="text-right">
                  <p className="text-xs text-gray-400">Neto a recibir</p>
                  <p className="text-xl font-bold text-brand-purple">{formatCOP(p.netPay)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={p.status === 'PAID' ? 'badge-paid' : 'badge-pending'}>
                    {p.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                  </span>
                  <Link
                    href={`/employee/colillas/${p.id}/pdf`}
                    className="w-9 h-9 bg-brand-purple/10 rounded-xl flex items-center justify-center hover:bg-brand-purple hover:text-white transition-all group"
                    target="_blank"
                  >
                    <Download size={16} className="text-brand-purple group-hover:text-white" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Detalles */}
            <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Salario Base', value: p.baseSalary },
                { label: 'Conectividad', value: p.conectividad },
                { label: 'Herramientas', value: p.tools },
                { label: 'Bonos', value: p.bonus + p.otherAdd },
              ].map((item) => (
                item.value > 0 && (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="font-semibold text-sm text-brand-navy">{formatCOP(item.value)}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}

        {payPeriods.length === 0 && (
          <div className="card text-center py-12">
            <FileText size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400">No hay colillas de pago registradas aún</p>
          </div>
        )}
      </div>
    </div>
  )
}
