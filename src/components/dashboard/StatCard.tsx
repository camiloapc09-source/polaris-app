import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  accent?: boolean
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, trendUp, accent }: StatCardProps) {
  if (accent) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #4429A6 0%, #F2421B 100%)',
        borderRadius: 16,
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 500, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
            <p style={{ color: 'white', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, wordBreak: 'break-all' }}>{value}</p>
            {subtitle && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 6 }}>{subtitle}</p>}
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={18} color="white" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: '24px',
      border: '1px solid #EFEFEF',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>{title}</p>
          <p style={{ color: '#0F1026', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, wordBreak: 'break-all' }}>{value}</p>
          {subtitle && <p style={{ color: '#BBBBBB', fontSize: 11, marginTop: 6 }}>{subtitle}</p>}
          {trend && (
            <p style={{ fontSize: 11, marginTop: 8, fontWeight: 600, color: trendUp ? '#16a34a' : '#dc2626' }}>
              {trend}
            </p>
          )}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(68,41,166,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color="#4429A6" />
        </div>
      </div>
    </div>
  )
}
