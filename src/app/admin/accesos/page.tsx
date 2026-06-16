import { prisma } from '@/lib/db'
import { ShieldCheck } from 'lucide-react'
import { ResetPasswordButton } from './ResetPasswordButton'

const ROLE_INFO: Record<string, { label: string; bg: string; color: string }> = {
  ADMIN:    { label: 'Star Shine', bg: '#EDE9FE', color: '#4429A6' },
  CLIENT:   { label: 'Cliente',    bg: '#DBEAFE', color: '#1D4ED8' },
  EMPLOYEE: { label: 'Empleado',   bg: '#DCFCE7', color: '#15803D' },
}

export default async function AdminAccesosPage() {
  const users = await prisma.user.findMany({
    include: { company: true },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  })

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Star Shine · Polaris
        </p>
        <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
          Accesos y Usuarios
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
          Restablece la contraseña de cualquier usuario que la haya olvidado
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              {['Usuario', 'Correo', 'Rol', 'Empresa', ''].map((h, i) => (
                <th key={h + i} style={{ textAlign: i === 4 ? 'right' : 'left', padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#A2A2A2', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const ri = ROLE_INFO[u.role] || { label: u.role, bg: '#F3F4F6', color: '#6B7280' }
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #F8F8F8' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#4429A6,#F2421B)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>{(u.name || '?').charAt(0).toUpperCase()}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0F1026' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#555' }}>{u.email}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: ri.bg, color: ri.color }}>
                      {ri.label}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#555' }}>{u.company?.name || '—'}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <ResetPasswordButton userId={u.id} userName={u.name} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, color: '#A2A2A2', fontSize: 12 }}>
        <ShieldCheck size={14} color="#4429A6" />
        Las contraseñas se guardan cifradas. Al restablecer, comunica la nueva contraseña al usuario por un canal seguro.
      </div>
    </div>
  )
}
