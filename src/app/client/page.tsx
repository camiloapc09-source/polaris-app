import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCOP, formatDate } from '@/lib/utils'
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
      <div style={{ marginBottom: 36 }}>
        <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Portal de Cliente · Polaris
        </p>
        <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
          {company?.name}
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
          Portal de cliente · Star Shine EOR
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)', borderRadius: 16, padding: 24, color: 'white' }}>
          <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Empleados activos en Colombia</p>
          <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{employees.length}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Facturas pagadas</p>
          <p style={{ color: '#0F1026', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{invoices.filter(i => i.status === 'PAID').length}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Facturas pendientes</p>
          <p style={{ color: '#0F1026', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{invoices.filter(i => i.status === 'PENDING').length}</p>
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
