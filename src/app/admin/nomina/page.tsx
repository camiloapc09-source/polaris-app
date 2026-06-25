import { prisma } from '@/lib/db'
import { formatCOP, formatDate } from '@/lib/utils'
import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import { NominaActions } from './NominaActions'

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div className="card text-white border-0" style={{ background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)' }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {payPeriods.map((p) => {
          const chips = [
            { label: 'Salario base', value: p.baseSalary },
            ...(p.conectividad > 0 ? [{ label: 'Conectividad', value: p.conectividad }] : []),
            ...(p.tools > 0 ? [{ label: 'Herramientas', value: p.tools }] : []),
            ...(p.bonus > 0 ? [{ label: 'Bono', value: p.bonus }] : []),
            ...(p.otherAdd > 0 ? [{ label: p.otherAddNote || 'Otro', value: p.otherAdd }] : []),
          ]
          return (
            <div key={p.id} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F0EDFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={20} color="#4429A6" />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#0F1026' }}>
                      {p.employee.firstName} {p.employee.lastName}
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#888' }}> · {p.employee.company.name}</span>
                    </p>
                    <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      {p.periodLabel}
                      {p.paidAt && <> — Pagado: {formatDate(p.paidAt)}</>}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 11, color: '#A2A2A2', marginBottom: 2 }}>Neto empleada</p>
                    <p style={{ fontSize: 17, fontWeight: 800, color: '#4429A6' }}>{formatCOP(p.netPay)}</p>
                  </div>
                  <span style={{
                    padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                    background: p.status === 'PAID' ? '#dcfce7' : '#fef9c3',
                    color: p.status === 'PAID' ? '#15803d' : '#a16207',
                  }}>
                    {p.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                  </span>
                  <NominaActions id={p.id} status={p.status} supportUrl={p.supportUrl} />
                </div>
              </div>

              {/* Desglose */}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #F5F5F5', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {chips.map(item => (
                  <div key={item.label} style={{ background: '#F5F5F5', borderRadius: 10, padding: '7px 12px' }}>
                    <p style={{ fontSize: 10, color: '#A2A2A2', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0F1026', marginTop: 2 }}>{formatCOP(item.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {payPeriods.length === 0 && (
          <div style={{ background: 'white', borderRadius: 16, padding: '48px 20px', border: '1px solid #EFEFEF', textAlign: 'center' }}>
            <FileText size={36} style={{ margin: '0 auto 12px', color: '#E8E8E8' }} />
            <p style={{ color: '#BBBBBB', fontSize: 14 }}>No hay pagos registrados aún</p>
          </div>
        )}
      </div>
    </div>
  )
}
