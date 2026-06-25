import { auth } from '@/lib/auth'
import { Sidebar } from './Sidebar'

export async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const user = session?.user as any

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5FA' }}>
      <Sidebar role={user?.role || 'EMPLOYEE'} userName={user?.name || 'Usuario'} />
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        <div style={{ padding: '40px 40px', maxWidth: '100%' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
