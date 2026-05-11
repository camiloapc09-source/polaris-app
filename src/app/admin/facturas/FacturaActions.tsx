'use client'

import { useState } from 'react'
import { CheckCircle, Trash2 } from 'lucide-react'
import { markFacturaPaid, deleteFactura } from '@/app/actions/facturas'

export function FacturaActions({ id, status }: { id: string; status: string }) {
  const [loading, setLoading] = useState(false)

  async function handlePaid() {
    setLoading(true)
    await markFacturaPaid(id)
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar esta factura?')) return
    setLoading(true)
    await deleteFactura(id)
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {status === 'PENDING' && (
        <button
          onClick={handlePaid}
          disabled={loading}
          style={{
            background: '#dcfce7', color: '#15803d',
            border: 'none', borderRadius: 8,
            padding: '6px 10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 600,
            fontFamily: 'Poppins, sans-serif',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <CheckCircle size={13} />
          Pagar
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        style={{
          background: '#fee2e2', color: '#b91c1c',
          border: 'none', borderRadius: 8,
          padding: '6px 10px', cursor: 'pointer',
          display: 'flex', alignItems: 'center',
          opacity: loading ? 0.5 : 1,
        }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
