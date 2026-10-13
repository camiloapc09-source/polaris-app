'use client'

import { useState } from 'react'
import { reviewCitaMedica } from '@/app/actions/citas'

// Aprobar / rechazar una cita. También permite cambiar la decisión después.
export function CitaReviewPanel({ id, status, adminNote }: { id: string; status: string; adminNote: string | null }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState(adminNote || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (status === 'CANCELLED') return null

  async function decide(next: 'APPROVED' | 'REJECTED') {
    setLoading(true)
    setError('')
    try {
      await reviewCitaMedica(id, { status: next, adminNote: note })
      setOpen(false)
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          background: status === 'PENDING' ? '#4429A6' : '#F4F4F7',
          color: status === 'PENDING' ? 'white' : '#0F1026',
          border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}
      >
        {status === 'PENDING' ? 'Revisar' : 'Cambiar decisión'}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 260 }}>
      <input
        style={{ width: '100%', background: '#F4F4F7', border: '1.5px solid transparent', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#0F1026', outline: 'none' }}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Nota para el empleado (opcional)"
      />
      {error && <p style={{ fontSize: 11, color: '#B91C1C' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={() => decide('APPROVED')}
          disabled={loading}
          style={{ flex: 1, background: '#DCFCE7', border: 'none', borderRadius: 10, padding: '8px', fontSize: 12, fontWeight: 600, color: '#15803D', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          Aprobar
        </button>
        <button
          onClick={() => decide('REJECTED')}
          disabled={loading}
          style={{ flex: 1, background: '#FEE2E2', border: 'none', borderRadius: 10, padding: '8px', fontSize: 12, fontWeight: 600, color: '#B91C1C', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          Rechazar
        </button>
        <button
          onClick={() => setOpen(false)}
          style={{ background: '#F4F4F7', border: 'none', borderRadius: 10, padding: '8px 10px', fontSize: 12, fontWeight: 600, color: '#888', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
