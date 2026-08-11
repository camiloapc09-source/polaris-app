import { prisma } from '@/lib/db'
import { Building2 } from 'lucide-react'
import { NuevoClienteForm } from './NuevoClienteForm'

export default async function ClientesPage() {
  const companies = await prisma.company.findMany({
    include: {
      employees: { where: { status: 'ACTIVE' } },
      users: { where: { role: 'CLIENT' } },
    },
    orderBy: { name: 'asc' },
  })

  const totalEmployees = companies.reduce((s, c) => s + c.employees.length, 0)
  const countries = new Set(companies.map((c) => c.country)).size

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
            Star Shine · Polaris
          </p>
          <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Clientes
          </h1>
          <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>Empresas gestionadas bajo modelo EOR</p>
        </div>
        <NuevoClienteForm />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)', borderRadius: 16, padding: 24, color: 'white' }}>
          <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Total clientes</p>
          <p style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>{companies.length}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Empleados activos</p>
          <p style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>{totalEmployees}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Países</p>
          <p style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>{countries}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {companies.map((company) => (
          <div
            key={company.id}
            style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', padding: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'linear-gradient(135deg, #4429A6, #F2421B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Building2 size={22} color="white" />
              </div>
              <div>
                <p style={{ color: '#0F1026', fontWeight: 700, fontSize: 16 }}>{company.name}</p>
                <p style={{ color: '#A2A2A2', fontSize: 12 }}>{company.country} · {company.currency}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: '#F8F8FB', borderRadius: 10, padding: '12px 16px' }}>
                <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600 }}>Empleados</p>
                <p style={{ color: '#0F1026', fontSize: 24, fontWeight: 800, marginTop: 4 }}>{company.employees.length}</p>
              </div>
              <div style={{ background: '#F8F8FB', borderRadius: 10, padding: '12px 16px' }}>
                <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600 }}>Usuarios</p>
                <p style={{ color: '#0F1026', fontSize: 24, fontWeight: 800, marginTop: 4 }}>{company.users.length}</p>
              </div>
            </div>

            {(company.contactName || company.contactEmail) && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #F0F0F0' }}>
                {company.contactName && (
                  <p style={{ color: '#888', fontSize: 12 }}>
                    Contacto: <span style={{ color: '#0F1026', fontWeight: 600 }}>{company.contactName}</span>
                  </p>
                )}
                {company.contactEmail && (
                  <p style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{company.contactEmail}</p>
                )}
              </div>
            )}
          </div>
        ))}

        {companies.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: '#BBBBBB', fontSize: 14 }}>
            No hay clientes registrados aún
          </div>
        )}
      </div>
    </div>
  )
}
