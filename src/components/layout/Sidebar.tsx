'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { StarShineLogo } from '@/components/brand/StarShineLogo'
import {
  LayoutDashboard, Users, DollarSign, TrendingUp,
  FileText, LogOut, Building2, Calendar, Receipt,
  HeartPulse, Stethoscope, Heart, Award, Send,
} from 'lucide-react'

interface NavItem { href: string; label: string; icon: React.ElementType; section?: string }

const adminNav: NavItem[] = [
  { href: '/admin',                label: 'Dashboard',          icon: LayoutDashboard },
  { href: '/admin/clientes',       label: 'Clientes',           icon: Building2 },
  { href: '/admin/empleados',      label: 'Empleados',          icon: Users },
  { href: '/admin/nomina',         label: 'Nómina',             icon: DollarSign },
  { href: '/admin/aportes',        label: 'Aportes Sociales',   icon: HeartPulse },
  { href: '/admin/ingresos',       label: 'Ingresos',           icon: TrendingUp },
  { href: '/admin/facturas',       label: 'Facturas Servicio',  icon: Receipt },
  { href: '/admin/incapacidades',  label: 'Incapacidades',      icon: Calendar },
  { href: '/admin/certificados',   label: 'Certificados',       icon: Award,       section: 'Servicios' },
  { href: '/admin/examenes',       label: 'Exámenes Médicos',   icon: Stethoscope, section: 'Servicios' },
  { href: '/admin/bienestar',      label: 'Bienestar',          icon: Heart,       section: 'Servicios' },
]

const clientNav: NavItem[] = [
  { href: '/client',               label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/client/empleados',     label: 'Empleados',        icon: Users },
  { href: '/client/pagos',         label: 'Pagos Enviados',   icon: Send },
  { href: '/client/colillas',      label: 'Colillas y Aportes', icon: FileText },
  { href: '/client/facturas',      label: 'Facturas',         icon: Receipt },
  { href: '/client/examenes',      label: 'Exámenes Médicos', icon: Stethoscope },
  { href: '/client/bienestar',     label: 'Bienestar',        icon: Heart },
]

const employeeNav: NavItem[] = [
  { href: '/employee',                   label: 'Mi Panel',           icon: LayoutDashboard },
  { href: '/employee/colillas',          label: 'Colillas de Pago',   icon: FileText },
  { href: '/employee/incapacidades',     label: 'Mis Incapacidades',  icon: HeartPulse },
  { href: '/employee/certificados',      label: 'Certificados',       icon: Award },
  { href: '/employee/examenes',          label: 'Exámenes Médicos',   icon: Stethoscope },
  { href: '/employee/bienestar',         label: 'Bienestar',          icon: Heart },
]

interface SidebarProps { role: string; userName: string }

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const nav = role === 'ADMIN' ? adminNav : role === 'CLIENT' ? clientNav : employeeNav
  const initial = userName.charAt(0).toUpperCase()

  return (
    <aside style={{
      width: 260,
      minHeight: '100vh',
      background: '#0F1026',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>

      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <StarShineLogo variant="white" width={130} />
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 6 }}>
          Polaris · Gestión de nómina
        </p>
      </div>

      {/* User info */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4429A6, #F2421B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{initial}</span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ color: 'white', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
              {role === 'ADMIN' ? 'Administrador' : role === 'CLIENT' ? 'Cliente' : 'Empleado'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {nav.map((item, idx) => {
          const Icon = item.icon
          const active = pathname === item.href ||
            (item.href !== '/admin' && item.href !== '/client' && item.href !== '/employee' && pathname.startsWith(item.href))
          const prevItem = nav[idx - 1]
          const showSection = item.section && item.section !== prevItem?.section

          return (
            <div key={item.href}>
              {showSection && (
                <p style={{
                  color: 'rgba(255,255,255,0.2)',
                  fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  padding: '12px 14px 4px',
                }}>
                  {item.section}
                </p>
              )}
              <Link
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'white' : 'rgba(255,255,255,0.5)',
                  background: active ? '#4429A6' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent' } }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </Link>
            </div>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 10,
            fontSize: 13, color: 'rgba(255,255,255,0.4)',
            background: 'none', border: 'none', cursor: 'pointer',
            width: '100%', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'none' }}
        >
          <LogOut size={16} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
