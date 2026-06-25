'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload } from 'lucide-react'
import { createPayPeriod } from '@/app/actions/payroll'
import { formatCOP } from '@/lib/utils'

type EmployeeOption = {
  id: string
  name: string
  companyName: string
  salary: number
  conectividadDefault: number
  toolsDefault: number
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

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
  fontWeight: 700,
  color: '#A2A2A2',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 6,
} as const

const sectionLabel = {
  fontSize: 11,
  fontWeight: 700,
  color: '#0F1026',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  marginBottom: 16,
  paddingBottom: 12,
  borderBottom: '1px solid #F0F0F0',
  display: 'block',
} as const

export function NuevoNominaForm({ employees }: { employees: EmployeeOption[] }) {
  const router = useRouter()
  const today = new Date()

  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? '')
  const [quincena, setQuincena] = useState<'1' | '2'>('1')
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [baseSalary, setBaseSalary] = useState(employees[0]?.salary ?? 0)
  const [conectividad, setConectividad] = useState(0)
  const [tools, setTools] = useState(0)
  const [bonus, setBonus] = useState(0)
  const [otherAdd, setOtherAdd] = useState(0)
  const [otherAddNote, setOtherAddNote] = useState('')
  const [deductions, setDeductions] = useState(0)
  const [deductionNote, setDeductionNote] = useState('')
  const [healthAmount, setHealthAmount] = useState(0)
  const [pensionAmount, setPensionAmount] = useState(0)
  const [status, setStatus] = useState('PAID')
  const [paidAt, setPaidAt] = useState(today.toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const emp = employees.find(e => e.id === employeeId)
    if (!emp) return
    setBaseSalary(emp.salary)
    setConectividad(quincena === '2' ? emp.conectividadDefault : 0)
    setTools(quincena === '2' ? emp.toolsDefault : 0)
    setHealthAmount(0)
    setPensionAmount(0)
  }, [employeeId, quincena])

  const netPay = baseSalary + conectividad + tools + bonus + otherAdd - deductions

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    let supportUrl: string | undefined
    if (file) {
      setUploading(true)
      const up = new FormData()
      up.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: up })
      const data = await res.json()
      supportUrl = data.url || undefined
      setUploading(false)
    }

    const result = await createPayPeriod({
      employeeId,
      quincena,
      month: month.toString(),
      year: year.toString(),
      baseSalary: baseSalary.toString(),
      conectividad: conectividad.toString(),
      tools: tools.toString(),
      bonus: bonus.toString(),
      otherAdd: otherAdd.toString(),
      otherAddNote,
      deductions: deductions.toString(),
      deductionNote,
      healthAmount: healthAmount > 0 ? healthAmount.toString() : undefined,
      pensionAmount: pensionAmount > 0 ? pensionAmount.toString() : undefined,
      status,
      paidAt: status === 'PAID' ? paidAt : undefined,
      notes,
      supportUrl,
    })
    if (result.success) router.push('/admin/nomina')
    else setSaving(false)
  }

  const selectedEmp = employees.find(e => e.id === employeeId)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link
          href="/admin/nomina"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#A2A2A2', fontSize: 13, fontWeight: 500, textDecoration: 'none', marginBottom: 16 }}
        >
          <ArrowLeft size={14} />
          Volver a Nómina
        </Link>
        <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Star Shine · Polaris
        </p>
        <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
          Nuevo Pago
        </h1>
        <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
          Registrar pago de nómina a empleado
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

          {/* Left column — main form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Sección 1: Empleado y período */}
            <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #EFEFEF' }}>
              <span style={sectionLabel}>Empleado y período</span>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Empleado</label>
                <select
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                  style={inputStyle}
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} · {e.companyName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quincena toggle */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Quincena</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {(['1', '2'] as const).map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuincena(q)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: quincena === q ? '2px solid #4429A6' : '2px solid #EFEFEF',
                        background: quincena === q ? '#F0EDFF' : 'white',
                        color: quincena === q ? '#4429A6' : '#888',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        fontFamily: 'Poppins, sans-serif',
                        transition: 'all 0.15s',
                      }}
                    >
                      {q === '1' ? '1ª Quincena · 1–15' : '2ª Quincena · 16–fin'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Mes</label>
                  <select value={month} onChange={e => setMonth(parseInt(e.target.value))} style={inputStyle}>
                    {MESES.map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Año</label>
                  <input
                    type="number"
                    value={year}
                    onChange={e => setYear(parseInt(e.target.value))}
                    min={2024}
                    max={2030}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Devengo */}
            <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #EFEFEF' }}>
              <span style={sectionLabel}>Devengo</span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Salario base (quincenal)</label>
                  <input
                    type="number"
                    min="0"
                    value={baseSalary}
                    onChange={e => setBaseSalary(parseFloat(e.target.value) || 0)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Auxilio conectividad</label>
                    {quincena === '1' && (
                      <span style={{ fontSize: 11, color: '#BBBBBB' }}>Solo 2ª quincena</span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={conectividad}
                    onChange={e => setConectividad(parseFloat(e.target.value) || 0)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Herramientas (ej: ChatGPT)</label>
                    {quincena === '1' && (
                      <span style={{ fontSize: 11, color: '#BBBBBB' }}>Solo 2ª quincena</span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={tools}
                    onChange={e => setTools(parseFloat(e.target.value) || 0)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Bono adicional</label>
                  <input
                    type="number"
                    min="0"
                    value={bonus}
                    onChange={e => setBonus(parseFloat(e.target.value) || 0)}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Otro concepto</label>
                    <input
                      type="number"
                      min="0"
                      value={otherAdd}
                      onChange={e => setOtherAdd(parseFloat(e.target.value) || 0)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Descripción</label>
                    <input
                      type="text"
                      placeholder="ej: Prima"
                      value={otherAddNote}
                      onChange={e => setOtherAddNote(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 3: Deducciones */}
            <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #EFEFEF' }}>
              <span style={sectionLabel}>Deducciones</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Monto</label>
                  <input
                    type="number"
                    min="0"
                    value={deductions}
                    onChange={e => setDeductions(parseFloat(e.target.value) || 0)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Descripción</label>
                  <input
                    type="text"
                    placeholder="ej: Préstamo"
                    value={deductionNote}
                    onChange={e => setDeductionNote(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Sección 4: Aportes sociales */}
            <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #EFEFEF' }}>
              <span style={sectionLabel}>Aportes Sociales <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10, color: '#BBBBBB' }}>— opcional, aparece en la colilla</span></span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Salud (EPS)</label>
                  <input
                    type="number"
                    min="0"
                    value={healthAmount}
                    onChange={e => setHealthAmount(parseFloat(e.target.value) || 0)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Pensión</label>
                  <input
                    type="number"
                    min="0"
                    value={pensionAmount}
                    onChange={e => setPensionAmount(parseFloat(e.target.value) || 0)}
                    style={inputStyle}
                  />
                </div>
              </div>
              {(healthAmount > 0 || pensionAmount > 0) && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: '#F8F7FF', borderRadius: 10, fontSize: 12, color: '#7F71D9' }}>
                  Costo total para Kover: <strong>{formatCOP(netPay + healthAmount + pensionAmount)}</strong>
                  {' '}(neto Justine + aportes)
                </div>
              )}
            </div>

            {/* Sección 5: Estado del pago */}
            <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #EFEFEF' }}>
              <span style={sectionLabel}>Estado del pago</span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {[{ val: 'PAID', label: 'Pagado' }, { val: 'DRAFT', label: 'Borrador' }].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setStatus(opt.val)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: status === opt.val ? '2px solid #4429A6' : '2px solid #EFEFEF',
                      background: status === opt.val ? '#F0EDFF' : 'white',
                      color: status === opt.val ? '#4429A6' : '#888',
                      fontWeight: 700, fontSize: 13,
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif',
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {status === 'PAID' && (
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Fecha de pago</label>
                  <input
                    type="date"
                    value={paidAt}
                    onChange={e => setPaidAt(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Comprobante de pago <span style={{ fontWeight: 400, textTransform: 'none' }}>(imagen / PDF, opcional)</span></label>
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

              <div>
                <label style={labelStyle}>Notas internas <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="ej: Pago realizado desde Davivienda"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Right column — resumen sticky */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #EFEFEF' }}>
              <span style={sectionLabel}>Resumen del pago</span>

              {selectedEmp && (
                <div style={{ marginBottom: 20, padding: '12px 14px', background: '#F8F7FF', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0F1026' }}>{selectedEmp.name}</p>
                  <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{selectedEmp.companyName}</p>
                  <p style={{ fontSize: 12, color: '#7F71D9', marginTop: 4, fontWeight: 600 }}>
                    {quincena === '1' ? '1ª Quincena (1–15)' : '2ª Quincena (16–fin)'} · {MESES[month - 1]} {year}
                  </p>
                </div>
              )}

              {/* Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'Salario base', value: baseSalary },
                  ...(conectividad > 0 ? [{ label: 'Conectividad', value: conectividad }] : []),
                  ...(tools > 0 ? [{ label: 'Herramientas', value: tools }] : []),
                  ...(bonus > 0 ? [{ label: 'Bono', value: bonus }] : []),
                  ...(otherAdd > 0 ? [{ label: otherAddNote || 'Otro concepto', value: otherAdd }] : []),
                  ...(deductions > 0 ? [{ label: 'Deducciones', value: -deductions }] : []),
                  ...(healthAmount > 0 ? [{ label: 'Salud (EPS)', value: healthAmount, extra: true }] : []),
                  ...(pensionAmount > 0 ? [{ label: 'Pensión', value: pensionAmount, extra: true }] : []),
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: (item as any).extra ? '#7F71D9' : '#888' }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: item.value < 0 ? '#E53E3E' : (item as any).extra ? '#7F71D9' : '#0F1026' }}>
                      {item.value < 0 ? '−' : ''}{formatCOP(Math.abs(item.value))}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '2px solid #F0F0F0', paddingTop: 16, marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0F1026' }}>Total a pagar</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#4429A6', letterSpacing: '-0.02em' }}>
                    {formatCOP(netPay)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || netPay <= 0}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 12, border: 'none',
                  background: saving || netPay <= 0 ? '#C0BADF' : '#4429A6',
                  color: 'white', fontWeight: 700, fontSize: 15,
                  cursor: saving || netPay <= 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  transition: 'background 0.15s',
                  marginBottom: 10,
                }}
              >
                {uploading ? 'Subiendo...' : saving ? 'Guardando...' : 'Registrar Pago'}
              </button>

              <Link
                href="/admin/nomina"
                style={{
                  display: 'block', textAlign: 'center',
                  padding: '12px 20px', borderRadius: 12,
                  border: '1.5px solid #EFEFEF',
                  color: '#888', fontWeight: 600, fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                Cancelar
              </Link>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}
