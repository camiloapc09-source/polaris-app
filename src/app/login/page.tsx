'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { StarShineLogo } from '@/components/brand/StarShineLogo'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── LEFT: Hero ── */}
      <div
        className="hidden lg:flex"
        style={{
          flex: 1,
          flexDirection: 'column',
          background: 'linear-gradient(150deg, #4429A6 0%, #3A22A8 50%, #B82E0E 100%)',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '44px 56px 0' }}>
          <StarShineLogo variant="white-orange" width={160} />
        </div>

        {/* Headline — centered */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 56px' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 28 }}>
            Polaris · Gestión de nómina
          </p>
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: 44, lineHeight: 1.08, marginBottom: 24 }}>
            Tu equipo<br />
            es la estrella.<br />
            <span style={{ color: '#F2421B' }}>Nosotros,</span><br />
            el motor.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, maxWidth: 320 }}>
            La misma precisión con la que organizamos eventos,
            la ponemos al servicio de tu nómina, seguridad social
            y pagos internacionales.
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: '0 56px 40px' }}>
          <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, letterSpacing: '0.08em' }}>
            © 2025 Star Shine S.A.S. — Barranquilla, Colombia
          </p>
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div style={{
        width: 460,
        flexShrink: 0,
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '48px 56px',
        overflowY: 'auto',
      }}>

        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <StarShineLogo variant="purple" width={130} />
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ color: '#0F1026', fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', marginBottom: 6 }}>
            Bienvenido
          </h1>
          <p style={{ color: '#A2A2A2', fontSize: 14 }}>Ingresa con tu cuenta para continuar</p>
        </div>

        {/* Form — capped at 300px */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300 }}>

          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            required
            style={{
              width: '100%',
              padding: '13px 20px',
              fontSize: 14,
              color: '#0F1026',
              background: '#F4F4F7',
              border: '1.5px solid transparent',
              borderRadius: 999,
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => { e.target.style.borderColor = '#4429A6'; e.target.style.background = '#fff' }}
            onBlur={e  => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#F4F4F7' }}
          />

          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              style={{
                width: '100%',
                padding: '13px 44px 13px 20px',
                fontSize: 14,
                color: '#0F1026',
                background: '#F4F4F7',
                border: '1.5px solid transparent',
                borderRadius: 999,
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#4429A6'; e.target.style.background = '#fff' }}
              onBlur={e  => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#F4F4F7' }}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', color: '#BBBBBB', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
            >
              <EyeIcon open={showPass} />
            </button>
          </div>

          {error && <p style={{ color: '#F2421B', fontSize: 12, paddingLeft: 8 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px 0',
              background: '#4429A6',
              color: 'white',
              fontWeight: 700,
              fontSize: 14,
              border: 'none',
              borderRadius: 999,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 4,
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#5533BB')}
            onMouseLeave={e => (e.currentTarget.style.background = '#4429A6')}
          >
            {loading ? 'Ingresando...' : <><span>Entrar</span><span style={{ opacity: 0.6 }}>→</span></>}
          </button>
        </form>

      </div>
    </div>
  )
}
