import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { FileText } from 'lucide-react'
import { CertActionsPanel } from './CertActionsPanel'

const TYPE_LABEL: Record<string, string> = {
  CARTA_LABORAL: 'Carta Laboral',
  CERT_INGRESOS: 'Certificado de Ingresos',
  CERT_VACACIONES: 'Certificado de Vacaciones',
  OTRO: 'Otro',
}

export default async function AdminCertificadosPage() {
  const certs = await prisma.certificadoLaboral.findMany({
    orderBy: { createdAt: 'desc' },
    include: { employee: { include: { company: true } } },
  })

  const pending = certs.filter((c) => c.status === 'PENDING').length
  const generated = certs.filter((c) => c.status === 'GENERATED').length

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Star Shine · Polaris
        </p>
        <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
          Certificados Laborales
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>Solicitudes de todos los empleados</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #F2421B 100%)', borderRadius: 16, padding: 24, color: 'white' }}>
          <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Total solicitudes</p>
          <p style={{ fontSize: 32, fontWeight: 800 }}>{certs.length}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Pendientes</p>
          <p style={{ color: '#0F1026', fontSize: 32, fontWeight: 800 }}>{pending}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Listos para entregar</p>
          <p style={{ color: '#0F1026', fontSize: 32, fontWeight: 800 }}>{generated}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {certs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', color: '#BBBBBB', fontSize: 14 }}>
            No hay solicitudes de certificados
          </div>
        )}
        {certs.map((cert) => (
          <div
            key={cert.id}
            style={{
              background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', padding: '20px 24px',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: '#F0EDFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FileText size={20} color="#4429A6" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#0F1026' }}>
                  {TYPE_LABEL[cert.type] || cert.type}
                </p>
                <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  {cert.employee.firstName} {cert.employee.lastName} · {cert.employee.company.name}
                </p>
                <p style={{ fontSize: 11, color: '#A2A2A2', marginTop: 2 }}>
                  {formatDate(cert.createdAt)}
                </p>
                {cert.requestNote && (
                  <p style={{ fontSize: 12, color: '#888', marginTop: 4, fontStyle: 'italic' }}>
                    "{cert.requestNote}"
                  </p>
                )}
                {cert.adminNote && (
                  <p style={{ fontSize: 12, color: '#4429A6', marginTop: 4 }}>
                    Nota admin: {cert.adminNote}
                  </p>
                )}
              </div>
            </div>
            <CertActionsPanel cert={cert} />
          </div>
        ))}
      </div>
    </div>
  )
}
