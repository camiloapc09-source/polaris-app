'use client'

import { useState } from 'react'
import { X, KeyRound, CheckCircle2 } from 'lucide-react'
import { adminResetPassword } from '@/app/actions/account'

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

export function ResetPasswordButton({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (newPassword !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      await adminResetPassword({ userId, newPassword })
      setDone(true)
    } catch (err: any) {
      setError(err.message || 'No se pudo restablecer')
    } finally {
      setLoading(false)
    }
  }

  function close() {
    setOpen(false)
    setNewPassword(''); setConfirm(''); setError(''); setDone(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: '#F4F4F7', color: '#4429A6',
        border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
      }}>
        <KeyRound size={13} /> Restablecer
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,16,38,0.55)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 420, padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F1026' }}>Restablecer contraseña</h2>
              <button onClick={close} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: 13, color: '#A2A2A2', marginBottom: 22 }}>
              Asignar una nueva contraseña para <strong style={{ color: '#0F1026' }}>{userName}</strong>.
            </p>

            {done ? (
              <div>
                <div style={{ background: '#DCFCE7', color: '#15803D', fontSize: 13, padding: '12px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <CheckCircle2 size={15} /> Contraseña restablecida. Comunícasela al usuario.
                </div>
                <button onClick={close} style={{ width: '100%', background: '#4429A6', border: 'none', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                  Listo
                </button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input style={inputStyle} type="text" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nueva contraseña (mín. 6)" />
                <input style={inputStyle} type="text" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirmar contraseña" />
                {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, padding: '10px 14px', borderRadius: 10 }}>{error}</div>}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" onClick={close} style={{ flex: 1, background: '#F4F4F7', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, color: '#0F1026', cursor: 'pointer' }}>Cancelar</button>
                  <button type="submit" disabled={loading} style={{ flex: 1, background: '#4429A6', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                    {loading ? 'Guardando...' : 'Restablecer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
