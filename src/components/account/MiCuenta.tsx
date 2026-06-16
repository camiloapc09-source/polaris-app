import { auth } from '@/lib/auth'
import { CambiarPasswordForm } from './CambiarPasswordForm'

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  CLIENT: 'Cliente',
  EMPLOYEE: 'Empleado',
}

export async function MiCuenta() {
  const session = await auth()
  const user = session?.user as any

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ color: '#0F1026', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
          Mi Cuenta
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
          Gestiona tus datos de acceso
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 460 }}>
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', padding: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#A2A2A2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            Datos de la cuenta
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#A2A2A2' }}>Nombre</span>
              <span style={{ fontSize: 13, color: '#0F1026', fontWeight: 600 }}>{user?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#A2A2A2' }}>Correo</span>
              <span style={{ fontSize: 13, color: '#0F1026', fontWeight: 600 }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#A2A2A2' }}>Rol</span>
              <span style={{ fontSize: 13, color: '#0F1026', fontWeight: 600 }}>{ROLE_LABEL[user?.role] || user?.role}</span>
            </div>
          </div>
        </div>

        <CambiarPasswordForm />
      </div>
    </div>
  )
}
