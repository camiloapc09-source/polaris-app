'use client'

import { useState } from 'react'
import { updateCertificado } from '@/app/actions/certificados'
import { Download } from 'lucide-react'

type Cert = {
  id: string
  status: string
  documentUrl: string | null
  adminNote: string | null
}

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:   { label: 'Pendiente',  bg: '#FEF9C3', color: '#A16207' },
  GENERATED: { label: 'Listo',      bg: '#DCFCE7', color: '#15803D' },
  DELIVERED: { label: 'Entregado',  bg: '#EDE9FE', color: '#4429A6' },
}

export function CertActionsPanel({ cert }: { cert: Cert }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ adminNote: cert.adminNote || '', documentUrl: cert.documentUrl || '' })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const st = STATUS_LABEL[cert.status] || STATUS_LABEL.PENDING

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setForm((f) => ({ ...f, documentUrl: data.url }))
    setUploading(false)
  }

  async function updateStatus(status: string) {
    setLoading(true)
    await updateCertificado(cert.id, { status, adminNote: form.adminNote, documentUrl: form.documentUrl })
    setLoading(false)
    setOpen(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0, position: 'relative' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>
        {st.label}
      </span>

      {cert.documentUrl && (
        <a href={cert.documentUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#4429A6', fontWeight: 600, textDecoration: 'none' }}>
          <Download size={13} /> Ver documento
        </a>
      )}

      {cert.status !== 'DELIVERED' && (
        <button
          onClick={() => setOpen(!open)}
          style={{ background: '#F4F4F7', border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#0F1026', cursor: 'pointer' }}
        >
          Gestionar
        </button>
      )}

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 0, zIndex: 20,
          background: 'white', borderRadius: 14, border: '1px solid #E8E8E8',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)', padding: 20, width: 320,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#A2A2A2', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
                Nota para el empleado
              </label>
              <input
                style={{ width: '100%', background: '#F4F4F7', border: '1.5px solid transparent', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#0F1026', outline: 'none' }}
                value={form.adminNote}
                onChange={(e) => setForm((f) => ({ ...f, adminNote: e.target.value }))}
                placeholder="Listo para descargar..."
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#A2A2A2', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
                Subir documento (PDF)
              </label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFile} style={{ fontSize: 12 }} />
              {uploading && <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Subiendo...</p>}
              {form.documentUrl && <p style={{ fontSize: 11, color: '#22C55E', marginTop: 4 }}>✓ Documento cargado</p>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {cert.status === 'PENDING' && (
                <button
                  onClick={() => updateStatus('GENERATED')}
                  disabled={loading}
                  style={{ background: '#DCFCE7', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 12, fontWeight: 600, color: '#15803D', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
                >
                  Marcar como Listo
                </button>
              )}
              {cert.status === 'GENERATED' && (
                <button
                  onClick={() => updateStatus('DELIVERED')}
                  disabled={loading}
                  style={{ background: '#EDE9FE', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 12, fontWeight: 600, color: '#4429A6', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
                >
                  Marcar como Entregado
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{ background: '#F4F4F7', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 12, fontWeight: 600, color: '#888', cursor: 'pointer' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
