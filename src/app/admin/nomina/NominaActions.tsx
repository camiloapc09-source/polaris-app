'use client'

import { useState } from 'react'
import { CheckCircle, ExternalLink, Upload, X, Trash2 } from 'lucide-react'
import { markPayPeriodPaid, deletePayPeriod } from '@/app/actions/payroll'

export function NominaActions({ id, status, supportUrl }: { id: string; status: string; supportUrl?: string | null }) {
  const [loading, setLoading]   = useState(false)
  const [payOpen, setPayOpen]   = useState(false)
  const [file, setFile]         = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handlePaid() {
    setLoading(true)

    let url: string | undefined
    if (file) {
      setUploading(true)
      const up = new FormData()
      up.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: up })
      const data = await res.json()
      url = data.url || undefined
      setUploading(false)
    }

    await markPayPeriodPaid(id, url)
    setLoading(false)
    setPayOpen(false)
    setFile(null)
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este pago de nómina?')) return
    setLoading(true)
    await deletePayPeriod(id)
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {supportUrl && (
        <a
          href={supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Ver comprobante"
          style={{
            background: '#F0EDFF', color: '#4429A6',
            borderRadius: 8, padding: '6px 10px',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 600, textDecoration: 'none',
          }}
        >
          <ExternalLink size={13} /> Comprobante
        </a>
      )}
      {status !== 'PAID' && (
        <button
          onClick={() => setPayOpen(true)}
          disabled={loading}
          title="Marcar como pagado"
          style={{
            background: '#dcfce7', color: '#15803d',
            border: 'none', borderRadius: 8, padding: '6px 10px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 600, fontFamily: 'Poppins, sans-serif',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <CheckCircle size={13} /> Pagar
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        title="Eliminar"
        style={{
          background: '#fee2e2', color: '#b91c1c',
          border: 'none', borderRadius: 8, padding: '6px 10px',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          opacity: loading ? 0.5 : 1,
        }}
      >
        <Trash2 size={13} />
      </button>

      {payOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15,16,38,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}
          onClick={e => { if (e.target === e.currentTarget && !loading) { setPayOpen(false); setFile(null) } }}
        >
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(15,16,38,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h2 style={{ color: '#0F1026', fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Marcar nómina como pagada</h2>
                <p style={{ color: '#BBBBBB', fontSize: 13 }}>Adjunta el comprobante de pago (opcional)</p>
              </div>
              <button onClick={() => { setPayOpen(false); setFile(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#BBBBBB', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <label style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#F4F4F7', borderRadius: 10, padding: '11px 14px',
              cursor: 'pointer', fontSize: 13, color: file ? '#0F1026' : '#A2A2A2',
              marginBottom: 22,
            }}>
              <Upload size={16} color="#A2A2A2" />
              {file ? file.name : 'Seleccionar comprobante...'}
              <input
                type="file"
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setPayOpen(false); setFile(null) }}
                disabled={loading}
                style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #E8E8E8', background: 'white', color: '#666', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
              >
                Cancelar
              </button>
              <button
                onClick={handlePaid}
                disabled={loading}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: loading ? '#A7D9B8' : '#15803d',
                  color: 'white', fontWeight: 700, fontSize: 14,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <CheckCircle size={14} />
                {uploading ? 'Subiendo...' : loading ? 'Guardando...' : 'Confirmar pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
