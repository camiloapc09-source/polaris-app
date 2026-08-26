'use client'

import { useState } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'
import { createFactura } from '@/app/actions/facturas'

const inputStyle = {
  width: '100%',
  background: '#F4F4F7',
  border: '1.5px solid transparent',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 13,
  color: '#0F1026',
  outline: 'none',
  fontFamily: 'Poppins, sans-serif',
} as const

const labelStyle = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700 as const,
  color: '#A2A2A2',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  marginBottom: 4,
}

interface LineItemState {
  id: string
  description: string
  subtitle: string
  period: string
  baseAmount: string
  hasIVA: boolean
  hasGastos: boolean
}

interface Company { id: string; name: string }

const DOT_COLORS = ['#4329A6', '#F2421A', '#4329A6', '#F2421A', '#4329A6', '#F2421A']

function newId() { return Math.random().toString(36).slice(2) }

function initItems(): LineItemState[] {
  return [
    { id: newId(), description: 'Nómina', subtitle: '', period: '', baseAmount: '', hasIVA: false, hasGastos: true },
    { id: newId(), description: 'Herramienta de trabajo', subtitle: '', period: '', baseAmount: '', hasIVA: false, hasGastos: true },
    { id: newId(), description: 'Auxilio de conectividad', subtitle: '', period: '', baseAmount: '', hasIVA: false, hasGastos: true },
  ]
}

export function NuevaFacturaForm({ companies }: { companies: Company[] }) {
  const [open, setOpen]               = useState(false)
  const [saving, setSaving]           = useState(false)
  const [companyId, setCompanyId]     = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10))
  const [items, setItems]             = useState<LineItemState[]>(initItems)

  const fmt = (v: number) =>
    v > 0
      ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v)
      : '—'

  function getCalc(item: LineItemState) {
    const base   = parseFloat(item.baseAmount) || 0
    const gastos = item.hasGastos ? Math.round(base * 0.04) : 0
    const iva    = item.hasIVA ? Math.round(base * 0.19) : 0
    const total  = base + gastos + iva
    return { base, gastos, iva, total }
  }

  function updateItem(id: string, field: keyof LineItemState, value: string | boolean) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function addItem() {
    setItems(prev => [...prev, { id: newId(), description: '', subtitle: '', period: '', baseAmount: '', hasIVA: false, hasGastos: true }])
  }

  function handleClose() {
    setOpen(false)
    setSaving(false)
    setCompanyId('')
    setInvoiceNumber('')
    setInvoiceDate(new Date().toISOString().slice(0, 10))
    setItems(initItems())
  }

  const grandTotal = items.reduce((s, i) => s + getCalc(i).total, 0)
  const totalGastos = items.reduce((s, i) => s + getCalc(i).gastos, 0)
  const totalIva = items.reduce((s, i) => s + getCalc(i).iva, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId) return
    setSaving(true)

    const validItems = items.filter(i => i.description.trim() && parseFloat(i.baseAmount) > 0)
    if (validItems.length === 0) { setSaving(false); return }

    const lineItems = validItems.map(i => {
      const { base, gastos, iva, total } = getCalc(i)
      return {
        description: i.description.trim(),
        subtitle: i.subtitle.trim(),
        period: i.period.trim(),
        baseAmount: base,
        hasIVA: i.hasIVA,
        gastosAmount: gastos,
        ivaAmount: iva,
        total,
      }
    })

    const period = invoiceDate ? invoiceDate.slice(0, 7) : new Date().toISOString().slice(0, 7)

    await createFactura({
      companyId,
      invoiceNumber,
      invoiceDate,
      period,
      lineItemsJson: JSON.stringify(lineItems),
    })

    setSaving(false)
    handleClose()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#4429A6', color: 'white',
          fontWeight: 600, fontSize: 14,
          padding: '10px 20px', borderRadius: 12,
          border: 'none', cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        <Plus size={16} />
        Nueva Factura
      </button>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15,16,38,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 740, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(15,16,38,0.22)' }}>
            <div style={{ padding: '28px 32px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
              <div>
                <h2 style={{ color: '#0F1026', fontSize: 20, fontWeight: 800, marginBottom: 2 }}>Nueva Cuenta de Cobro</h2>
                <p style={{ color: '#BBBBBB', fontSize: 13 }}>Factura de servicio de Star Shine al cliente</p>
              </div>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#BBBBBB', padding: 4, marginTop: -4 }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #F8F8F8' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Cliente</label>
                    <select
                      required
                      value={companyId}
                      onChange={e => setCompanyId(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Seleccionar...</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>N° Factura</label>
                    <input
                      type="text"
                      placeholder="ej: 128"
                      value={invoiceNumber}
                      onChange={e => setInvoiceNumber(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Fecha de emisión</label>
                    <input
                      type="date"
                      required
                      value={invoiceDate}
                      onChange={e => setInvoiceDate(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #F8F8F8' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#A2A2A2', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Ítems de factura
                    <span style={{ marginLeft: 8, background: '#F0EDFF', color: '#4429A6', borderRadius: 99, padding: '2px 8px', fontSize: 10 }}>
                      Gastos bancarios 4% por ítem · IVA 19% opcional
                    </span>
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {items.map((item, idx) => {
                    const { base, gastos, iva, total } = getCalc(item)
                    const dotColor = DOT_COLORS[idx % DOT_COLORS.length]
                    return (
                      <div key={item.id} style={{ background: '#FAFAFA', borderRadius: 12, padding: '14px 16px', border: '1px solid #EFEFEF' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, marginTop: 10, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr', gap: 8, marginBottom: 8 }}>
                              <div>
                                <label style={labelStyle}>Descripción</label>
                                <input
                                  type="text"
                                  placeholder="ej: Nómina 1ª quincena junio"
                                  value={item.description}
                                  onChange={e => updateItem(item.id, 'description', e.target.value)}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Empleado / Subtítulo</label>
                                <input
                                  type="text"
                                  placeholder="ej: Justine Escamilla"
                                  value={item.subtitle}
                                  onChange={e => updateItem(item.id, 'subtitle', e.target.value)}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Período</label>
                                <input
                                  type="text"
                                  placeholder="ej: Jun 1-15, 2026"
                                  value={item.period}
                                  onChange={e => updateItem(item.id, 'period', e.target.value)}
                                  style={inputStyle}
                                />
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                              <div style={{ flex: '0 0 160px' }}>
                                <label style={labelStyle}>Valor base (COP)</label>
                                <input
                                  type="number"
                                  placeholder="0"
                                  min="0"
                                  step="any"
                                  value={item.baseAmount}
                                  onChange={e => updateItem(item.id, 'baseAmount', e.target.value)}
                                  style={inputStyle}
                                />
                              </div>

                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: '#888', marginTop: 18 }}>
                                <input
                                  type="checkbox"
                                  checked={item.hasGastos}
                                  onChange={e => updateItem(item.id, 'hasGastos', e.target.checked)}
                                  style={{ accentColor: '#4429A6', width: 14, height: 14 }}
                                />
                                <span style={{ fontWeight: 600 }}>4% gastos</span>
                              </label>

                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: '#888', marginTop: 18 }}>
                                <input
                                  type="checkbox"
                                  checked={item.hasIVA}
                                  onChange={e => updateItem(item.id, 'hasIVA', e.target.checked)}
                                  style={{ accentColor: '#F2421A', width: 14, height: 14 }}
                                />
                                <span style={{ fontWeight: 600 }}>IVA 19%</span>
                              </label>

                              {base > 0 && (
                                <div style={{ display: 'flex', gap: 12, marginTop: 18, fontSize: 12 }}>
                                  <span style={{ color: '#A2A2A2' }}>
                                    Gastos: <strong style={{ color: '#0F1026' }}>{fmt(gastos)}</strong>
                                  </span>
                                  {iva > 0 && (
                                    <span style={{ color: '#A2A2A2' }}>
                                      IVA: <strong style={{ color: '#F2421A' }}>{fmt(iva)}</strong>
                                    </span>
                                  )}
                                  <span style={{ color: '#A2A2A2' }}>
                                    Total: <strong style={{ color: '#4429A6' }}>{fmt(total)}</strong>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DDDDDD', padding: 4, marginTop: 2, flexShrink: 0 }}
                            title="Eliminar ítem"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  style={{
                    marginTop: 12, width: '100%',
                    background: 'none', border: '1.5px dashed #D8D8D8',
                    borderRadius: 10, padding: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontSize: 13, color: '#AAAAAA', cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  <Plus size={14} />
                  Agregar ítem personalizado
                </button>
              </div>

              {/* Totals summary */}
              {grandTotal > 0 && (
                <div style={{ padding: '20px 32px', background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
                  <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 12 }}>
                    <div>
                      <p style={{ fontSize: 10, color: '#A2A2A2', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Total base</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0F1026' }}>{fmt(items.reduce((s, i) => s + getCalc(i).base, 0))}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: '#A2A2A2', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Gastos bancarios (4%)</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0F1026' }}>{fmt(totalGastos)}</p>
                    </div>
                    {totalIva > 0 && (
                      <div>
                        <p style={{ fontSize: 10, color: '#A2A2A2', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>IVA (19%)</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#F2421A' }}>{fmt(totalIva)}</p>
                      </div>
                    )}
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #4429A6, #F2421B)',
                    borderRadius: 12, padding: '14px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 600 }}>TOTAL A FACTURAR</p>
                    <p style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>
                      {fmt(grandTotal)}
                    </p>
                  </div>
                </div>
              )}

              <div style={{ padding: '20px 32px', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #E8E8E8', background: 'white', color: '#666', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 28px', borderRadius: 10, border: 'none',
                    background: saving ? '#C0BADF' : '#4429A6',
                    color: 'white', fontWeight: 700, fontSize: 14,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    transition: 'background 0.15s',
                  }}
                >
                  {saving ? 'Guardando...' : 'Crear Factura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
