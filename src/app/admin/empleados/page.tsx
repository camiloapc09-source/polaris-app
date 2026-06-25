import { prisma } from '@/lib/db'
import { formatCOP, formatDate } from '@/lib/utils'
import { NuevoEmpleadoForm } from './NuevoEmpleadoForm'
import { updateEmployeeStatus } from '@/app/actions/empleados'
import { Users } from 'lucide-react'

export default async function EmpleadosPage() {
  const [employees, companies] = await Promise.all([
    prisma.employee.findMany({
      include: { company: true, payPeriods: { orderBy: { periodEnd: 'desc' }, take: 1 } },
      orderBy: { firstName: 'asc' },
    }),
    prisma.company.findMany({ orderBy: { name: 'asc' } }),
  ])

  const active = employees.filter((e) => e.status === 'ACTIVE').length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
            Star Shine · Polaris
          </p>
          <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Empleados
          </h1>
          <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>Todos los colaboradores gestionados</p>
        </div>
        <NuevoEmpleadoForm companies={companies} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)', borderRadius: 16, padding: 24, color: 'white' }}>
          <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Total empleados</p>
          <p style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>{employees.length}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Activos</p>
          <p style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>{active}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Clientes atendidos</p>
          <p style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>{companies.length}</p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              {['Empleado', 'Empresa', 'Cargo', 'Inicio', 'Salario Q.', 'Último pago', 'Estado', ''].map((h, i) => (
                <th
                  key={h + i}
                  style={{
                    textAlign: 'left', padding: '14px 20px',
                    fontSize: 11, fontWeight: 700, color: '#A2A2A2',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '56px 20px', color: '#BBBBBB', fontSize: 14 }}>
                  No hay empleados registrados
                </td>
              </tr>
            )}
            {employees.map((emp, idx) => {
              const lastPay = emp.payPeriods[0]
              const isActive = emp.status === 'ACTIVE'
              const initial = emp.firstName.charAt(0) + emp.lastName.charAt(0)
              return (
                <tr key={emp.id} style={{ borderBottom: idx < employees.length - 1 ? '1px solid #F8F8F8' : 'none' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4429A6, #F2421B)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{initial}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0F1026' }}>{emp.firstName} {emp.lastName}</p>
                        <p style={{ fontSize: 11, color: '#A2A2A2' }}>{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#888' }}>{emp.company.name}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#888' }}>{emp.position}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#888' }}>{formatDate(emp.startDate)}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#0F1026', fontWeight: 600 }}>{formatCOP(emp.salary)}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#4429A6', fontWeight: 600 }}>
                    {lastPay ? formatCOP(lastPay.netPay) : <span style={{ color: '#D0D0D0' }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                      background: isActive ? '#DCFCE7' : '#F3F4F6',
                      color: isActive ? '#15803D' : '#6B7280',
                    }}>
                      {isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <form action={async () => {
                      'use server'
                      await updateEmployeeStatus(emp.id, isActive ? 'INACTIVE' : 'ACTIVE')
                    }}>
                      <button
                        type="submit"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: 11, fontWeight: 600,
                          color: isActive ? '#EF4444' : '#22C55E',
                          padding: '4px 8px', borderRadius: 6,
                        }}
                      >
                        {isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
