import { auth } from '@/lib/auth'
import { Sidebar } from './Sidebar'

export async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const user = session?.user as any

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5FA' }}>
      <Sidebar role={user?.role || 'EMPLOYEE'} userName={user?.name || 'Usuario'} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '40px 40px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
