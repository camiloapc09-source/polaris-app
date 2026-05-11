import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { SolicitudCertForm } from './SolicitudCertForm'
import { FileText, Download } from 'lucide-react'

const TYPE_LABEL: Record<string, string> = {
  CARTA_LABORAL: 'Carta Laboral',
  CERT_INGRESOS: 'Certificado de Ingresos',
  CERT_VACACIONES: 'Certificado de Vacaciones',
  OTRO: 'Otro',
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: 'En proceso',  cls: 'badge-pending' },
  GENERATED: { label: 'Listo',       cls: 'badge-active' },
  DELIVERED: { label: 'Entregado',   cls: 'badge-paid' },
}

export default async function CertificadosPage() {
  const session = await auth()
  const user = session?.user as any
  const employeeId = user?.employeeId

  const certs = await prisma.certificadoLaboral.findMany({
    where: { employeeId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <h1 style={{ color: '#0F1026', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Mis Certificados
          </h1>
          <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
            Solicita y descarga tus certificados laborales
          </p>
        </div>
        <SolicitudCertForm />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {certs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #EFEFEF' }}>
            <FileText size={32} style={{ color: '#D0D0D0', margin: '0 auto 12px' }} />
            <p style={{ color: '#BBBBBB', fontSize: 14 }}>Aún no has solicitado certificados</p>
          </div>
        )}
        {certs.map((cert) => {
          const st = STATUS_LABEL[cert.status] || STATUS_LABEL.PENDING
          return (
            <div
              key={cert.id}
              style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#F0EDFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <FileText size={20} color="#4429A6" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#0F1026' }}>{TYPE_LABEL[cert.type] || cert.type}</p>
                  <p style={{ fontSize: 12, color: '#A2A2A2', marginTop: 2 }}>
                    Solicitado el {formatDate(cert.createdAt)}
                  </p>
                  {cert.requestNote && (
                    <p style={{ fontSize: 12, color: '#888', marginTop: 3 }}>"{cert.requestNote}"</p>
                  )}
                  {cert.adminNote && (
                    <p style={{ fontSize: 12, color: '#4429A6', marginTop: 3 }}>Nota: {cert.adminNote}</p>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <span className={st.cls}>{st.label}</span>
                {cert.documentUrl && (
                  <a
                    href={cert.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: '#4429A6', color: 'white', textDecoration: 'none',
                      borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 600,
                    }}
                  >
                    <Download size={14} />
                    Descargar
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
