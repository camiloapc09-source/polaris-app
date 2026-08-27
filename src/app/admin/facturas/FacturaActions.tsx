'use client'

import { useState } from 'react'
import { FileText, Trash2, CheckCircle, ExternalLink, DollarSign, Upload } from 'lucide-react'
import { confirmFacturaPaid, deleteFactura } from '@/app/actions/facturas'

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
} as const

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700 as const,
  color: '#A2A2A2',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  marginBottom: 6,
}

interface Props {
  id: string
  status: string
  sentEvidenceUrl?: string | null
  sentAmountUSD?: number | null
  companyName: string
}

export function FacturaActions({ id, status, sentEvidenceUrl, sentAmountUSD, companyName }: Props) {
  const [loading, setLoading]       = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [copAmount, setCopAmount]   = useState('')
  const [usdAmount, setUsdAmount]   = useState('')
  const [file, setFile]             = useState<File | null>(null)

  // Si el cliente ya reportó el envío, esos datos ya vienen con la factura y no
  // se vuelven a pedir; si no, el admin puede aportarlos él mismo u omitirlos.
  const yaReportado = sentAmountUSD != null
  const yaTieneEvidencia = !!sentEvidenceUrl

  const fmtUSD = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  function handleCloseConfirm() {
    setConfirmOpen(false)
    setCopAmount('')
    setUsdAmount('')
    setFile(null)
  }

  async function handleConfirmPaid() {
    if (!copAmount) return
    setLoading(true)

    let evidenceUrl = ''
    if (file) {
      setUploading(true)
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      evidenceUrl = data.url ?? ''
      setUploading(false)

      // Si adjuntó evidencia y la subida falló, no se registra el cobro: se
      // perdería el archivo sin que el admin se entere.
      if (!evidenceUrl) {
        setLoading(false)
        alert('No se pudo subir la evidencia. Intenta de nuevo, o quita el archivo para registrar el cobro sin adjuntarla.')
        return
      }
    }

    await confirmFacturaPaid(id, parseFloat(copAmount), {
      sentAmountUSD: usdAmount ? parseFloat(usdAmount) : null,
      evidenceUrl: evidenceUrl || null,
    })
    setLoading(false)
    handleCloseConfirm()
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar esta factura? Esta acción no se puede deshacer.')) return
    setLoading(true)
    await deleteFactura(id)
    setLoading(false)
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <a
          href={`/admin/facturas/${id}/pdf`}
          target="_blank"
          style={{
            background: '#F0EDFF', color: '#4429A6',
            borderRadius: 8, padding: '6px 10px',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 600, textDecoration: 'none',
          }}
        >
          <FileText size={13} />
          PDF
        </a>

        {status !== 'PAID' && (
          <button
            onClick={() => setConfirmOpen(true)}
            style={{
              background: '#dcfce7', color: '#15803d',
              border: 'none', borderRadius: 8, padding: '6px 10px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, fontWeight: 600, fontFamily: 'Poppins, sans-serif',
            }}
          >
            <CheckCircle size={13} />
            Marcar cobrada
          </button>
        )}

        {sentEvidenceUrl && (
          <a
            href={sentEvidenceUrl}
            target="_blank"
            style={{
              background: '#fef3c7', color: '#d97706',
              borderRadius: 8, padding: '6px 10px',
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}
          >
            <ExternalLink size={13} />
            Evidencia
          </a>
        )}

        {status === 'PENDING' && (
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{
              background: '#fee2e2', color: '#b91c1c',
              border: 'none', borderRadius: 8, padding: '6px 10px',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              opacity: loading ? 0.5 : 1,
            }}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {confirmOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15,16,38,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) handleCloseConfirm() }}
        >
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(15,16,38,0.18)' }}>
            <h2 style={{ color: '#0F1026', fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Registrar Cobro</h2>
            <p style={{ color: '#BBBBBB', fontSize: 13, marginBottom: 20 }}>
              {yaReportado ? (
                <>
                  {companyName} reportó envío de{' '}
                  <strong style={{ color: '#0F1026' }}>{fmtUSD(sentAmountUSD!)}</strong>.
                  Ingresa el monto que recibiste en COP.
                </>
              ) : (
                <>
                  {companyName} aún no ha reportado el envío. Puedes registrar el cobro
                  de todos modos y, si quieres, adjuntar tú la evidencia.
                </>
              )}
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Monto recibido (COP)</label>
              <input
                type="number"
                placeholder="ej: 1681955"
                min="1"
                step="any"
                value={copAmount}
                onChange={e => setCopAmount(e.target.value)}
                style={inputStyle}
                autoFocus
              />
            </div>

            {!yaReportado && (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>
                  Monto enviado (USD){' '}
                  <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10 }}>(opcional)</span>
                </label>
                <input
                  type="number"
                  placeholder="ej: 420.50"
                  min="0.01"
                  step="any"
                  value={usdAmount}
                  onChange={e => setUsdAmount(e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}

            {!yaTieneEvidencia && (
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>
                  Evidencia de pago{' '}
                  <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10 }}>(opcional)</span>
                </label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#F4F4F7', borderRadius: 10, padding: '11px 14px',
                  cursor: 'pointer', fontSize: 13, color: file ? '#0F1026' : '#A2A2A2',
                }}>
                  <Upload size={16} color="#A2A2A2" />
                  {file ? file.name : 'Seleccionar archivo...'}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    onChange={e => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCloseConfirm}
                style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #E8E8E8', background: 'white', color: '#666', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPaid}
                disabled={loading || !copAmount}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: loading || !copAmount ? '#C0BADF' : '#4429A6',
                  color: 'white', fontWeight: 700, fontSize: 14,
                  cursor: loading || !copAmount ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <DollarSign size={14} />
                {uploading ? 'Subiendo...' : loading ? 'Guardando...' : 'Confirmar cobro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
