interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  trend?: string
  trendUp?: boolean
  accent?: boolean
}

export function StatCard({ title, value, subtitle, trend, trendUp, accent }: StatCardProps) {
  if (accent) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)',
        borderRadius: 16,
        padding: 24,
        color: 'white',
      }}>
        <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>{title}</p>
        <p style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, wordBreak: 'break-word' }}>{value}</p>
        {subtitle && <p style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>{subtitle}</p>}
      </div>
    )
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: 24,
      border: '1px solid #EFEFEF',
    }}>
      <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>{title}</p>
      <p style={{ color: '#0F1026', fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, wordBreak: 'break-word' }}>{value}</p>
      {subtitle && <p style={{ color: '#BBBBBB', fontSize: 11, marginTop: 6 }}>{subtitle}</p>}
      {trend && (
        <p style={{ fontSize: 11, marginTop: 8, fontWeight: 600, color: trendUp ? '#16a34a' : '#dc2626' }}>
          {trend}
        </p>
      )}
    </div>
  )
}
