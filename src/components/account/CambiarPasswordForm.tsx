'use client'

import { useState } from 'react'
import { KeyRound, CheckCircle2 } from 'lucide-react'
import { cambiarPropiaPassword } from '@/app/actions/account'

const inputStyle = {
  width: '100%',
  background: '#F4F4F7',
  border: '1.5px solid transparent',
  borderRadius: 10,
  padding: '11px 14px',
  fontSize: 14,
  color: '#0F1026',
  outline: 'none',
  fontFamily: 'Poppins, sans-serif',
  boxSizing: 'border-box' as const,
}

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700 as const,
  color: '#A2A2A2',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  marginBottom: 6,
}

export function CambiarPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
    setError('')
    setSuccess(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (form.newPassword !== form.confirmPassword) {
      setError('La nueva contraseña y su confirmación no coinciden')
      return
    }
    setLoading(true)
    try {
      await cambiarPropiaPassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setSuccess(true)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setError(err.message || 'No se pudo cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', padding: 28, maxWidth: 460 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <KeyRound size={20} color="#4429A6" />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#0F1026' }}>Cambiar contraseña</p>
          <p style={{ fontSize: 12, color: '#A2A2A2' }}>Actualiza tu contraseña de acceso</p>
        </div>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Contraseña actual</label>
          <input style={inputStyle} type="password" required value={form.currentPassword} onChange={(e) => set('currentPassword', e.target.value)} placeholder="••••••••" />
        </div>
        <div>
          <label style={labelStyle}>Nueva contraseña</label>
          <input style={inputStyle} type="password" required minLength={6} value={form.newPassword} onChange={(e) => set('newPassword', e.target.value)} placeholder="Mínimo 6 caracteres" />
        </div>
        <div>
          <label style={labelStyle}>Confirmar nueva contraseña</label>
          <input style={inputStyle} type="password" required minLength={6} value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} placeholder="Repite la nueva contraseña" />
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 14px', borderRadius: 10 }}>{error}</div>
        )}
        {success && (
          <div style={{ background: '#DCFCE7', color: '#15803D', fontSize: 13, padding: '10px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={15} /> Contraseña actualizada correctamente
          </div>
        )}

        <button type="submit" disabled={loading}
          style={{ background: '#4429A6', border: 'none', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Guardando...' : 'Actualizar contraseña'}
        </button>
      </form>
    </div>
  )
}
