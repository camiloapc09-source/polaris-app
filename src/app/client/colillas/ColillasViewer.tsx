'use client'

import { useState } from 'react'
import { FileText, Download, HeartPulse, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface PayPeriodItem {
  id: string
  periodLabel: string
  periodStart: Date
  periodEnd: Date
  baseSalary: number
  conectividad: number
  tools: number
  bonus: number
  otherAdd: number
  otherAddNote: string | null
  healthAmount: number | null
  pensionAmount: number | null
  netPay: number
  status: string
  paidAt: Date | null
}

interface AporteItem {
  id: string
  period: string
  health: number
  pension: number
  arl: number
  caja: number
  lateFee: number
  total: number
  status: string
  voucherUrl: string | null
}

interface EmployeeData {
  id: string
  firstName: string
  lastName: string
  position: string
  payPeriods: PayPeriodItem[]
  socialContributions: AporteItem[]
}

interface Props {
  employees: EmployeeData[]
}

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

const formatDate = (d: Date | string) =>
  new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(d))

const monthLabel = (period: string) => {
  const [y, m] = period.split('-')
  if (!y || !m) return period
  return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('es-CO', { month: 'long', year: 'numeric' })
}

export function ColillasViewer({ employees }: Props) {
  const [selectedId, setSelectedId] = useState<string>(employees[0]?.id ?? '')
  const [tab, setTab] = useState<'colillas' | 'aportes'>('colillas')

  const emp = employees.find(e => e.id === selectedId)

  return (
    <div>
      {/* Selector de empleados — solo visible si hay más de uno */}
      {employees.length > 1 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          {employees.map(e => {
            const active = e.id === selectedId
            const initial = e.firstName.charAt(0) + e.lastName.charAt(0)
            return (
              <button
                key={e.id}
                onClick={() => { setSelectedId(e.id); setTab('colillas') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 20px', borderRadius: 14, cursor: 'pointer',
                  border: active ? '2px solid #4429A6' : '2px solid #EFEFEF',
                  background: active ? '#F0EDFF' : 'white',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: active ? '#4429A6' : 'linear-gradient(135deg, #4429A6, #F2421B)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{initial}</span>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: active ? '#4429A6' : '#0F1026' }}>
                    {e.firstName} {e.lastName}
                  </p>
                  <p style={{ fontSize: 11, color: '#888' }}>{e.position}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {emp && (
        <>
          {/* Nombre del empleado si solo hay uno */}
          {employees.length === 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'linear-gradient(135deg, #4429A6, #F2421B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>
                  {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <p style={{ fontSize: 17, fontWeight: 700, color: '#0F1026' }}>{emp.firstName} {emp.lastName}</p>
                <p style={{ fontSize: 12, color: '#888' }}>{emp.position}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#F4F4F7', borderRadius: 12, padding: 4, width: 'fit-content' }}>
            {([
              { key: 'colillas', label: 'Colillas de Pago', icon: FileText },
              { key: 'aportes', label: 'Aportes Sociales', icon: HeartPulse },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 18px', borderRadius: 9, border: 'none',
                  background: tab === key ? 'white' : 'transparent',
                  color: tab === key ? '#4429A6' : '#888',
                  fontWeight: tab === key ? 700 : 500,
                  fontSize: 13, cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* COLILLAS */}
          {tab === 'colillas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {emp.payPeriods.map(p => {
                const totalAportes = (p.healthAmount || 0) + (p.pensionAmount || 0)
                const costoTotal = p.netPay + totalAportes
                return (
                  <div key={p.id} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F0EDFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={20} color="#4429A6" />
                        </div>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#0F1026' }}>{p.periodLabel}</p>
                          <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                            {formatDate(p.periodStart)} — {formatDate(p.periodEnd)}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 11, color: '#A2A2A2', marginBottom: 2 }}>Neto empleada</p>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#0F1026' }}>{formatCOP(p.netPay)}</p>
                        </div>
                        {totalAportes > 0 && (
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: 11, color: '#A2A2A2', marginBottom: 2 }}>Aportes (S+P)</p>
                            <p style={{ fontSize: 14, fontWeight: 700, color: '#7F71D9' }}>{formatCOP(totalAportes)}</p>
                          </div>
                        )}
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 11, color: '#A2A2A2', marginBottom: 2 }}>Tu costo total</p>
                          <p style={{ fontSize: 17, fontWeight: 800, color: '#4429A6' }}>{formatCOP(costoTotal)}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                            background: p.status === 'PAID' ? '#dcfce7' : '#fef9c3',
                            color: p.status === 'PAID' ? '#15803d' : '#a16207',
                          }}>
                            {p.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                          </span>
                          <Link
                            href={`/employee/colillas/${p.id}/pdf`}
                            target="_blank"
                            style={{
                              width: 36, height: 36, background: '#F0EDFF', borderRadius: 10,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              textDecoration: 'none',
                            }}
                          >
                            <Download size={15} color="#4429A6" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Desglose */}
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #F5F5F5', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {[
                        { label: 'Salario base', value: p.baseSalary },
                        ...(p.conectividad > 0 ? [{ label: 'Conectividad', value: p.conectividad }] : []),
                        ...(p.tools > 0 ? [{ label: 'Herramientas', value: p.tools }] : []),
                        ...(p.bonus > 0 ? [{ label: 'Bono', value: p.bonus }] : []),
                        ...(p.otherAdd > 0 ? [{ label: p.otherAddNote || 'Otro', value: p.otherAdd }] : []),
                        ...(p.healthAmount ? [{ label: 'Salud (EPS)', value: p.healthAmount, purple: true }] : []),
                        ...(p.pensionAmount ? [{ label: 'Pensión', value: p.pensionAmount, purple: true }] : []),
                      ].map(item => (
                        <div key={item.label} style={{
                          background: (item as any).purple ? '#F8F7FF' : '#F5F5F5',
                          borderRadius: 10, padding: '7px 12px',
                        }}>
                          <p style={{ fontSize: 10, color: '#A2A2A2', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: (item as any).purple ? '#4429A6' : '#0F1026', marginTop: 2 }}>
                            {formatCOP(item.value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {emp.payPeriods.length === 0 && (
                <div style={{ background: 'white', borderRadius: 16, padding: '48px 20px', border: '1px solid #EFEFEF', textAlign: 'center' }}>
                  <FileText size={36} style={{ margin: '0 auto 12px', color: '#E8E8E8' }} />
                  <p style={{ color: '#BBBBBB', fontSize: 14 }}>No hay colillas registradas aún</p>
                </div>
              )}
            </div>
          )}

          {/* APORTES SOCIALES */}
          {tab === 'aportes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {emp.socialContributions.map(a => (
                <div key={a.id} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F0EDFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HeartPulse size={18} color="#4429A6" />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0F1026', textTransform: 'capitalize' }}>{monthLabel(a.period)}</p>
                        <p style={{ fontSize: 12, color: '#888' }}>Planilla seguridad social</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 11, color: '#A2A2A2', marginBottom: 2 }}>Total</p>
                        <p style={{ fontSize: 17, fontWeight: 800, color: '#4429A6' }}>{formatCOP(a.total)}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                          background: a.status === 'PAID' ? '#dcfce7' : '#fef9c3',
                          color: a.status === 'PAID' ? '#15803d' : '#a16207',
                        }}>
                          {a.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                        </span>
                        {a.voucherUrl && (
                          <a
                            href={a.voucherUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver comprobante de pago"
                            style={{
                              width: 36, height: 36, background: '#F0EDFF', borderRadius: 10,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              textDecoration: 'none',
                            }}
                          >
                            <ExternalLink size={15} color="#4429A6" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Salud EPS', value: a.health },
                      { label: 'Pensión', value: a.pension },
                      { label: 'ARL', value: a.arl },
                      { label: 'Caja Comp.', value: a.caja },
                      ...(a.lateFee > 0 ? [{ label: 'Mora', value: a.lateFee }] : []),
                    ].filter(i => i.value > 0).map(item => (
                      <div key={item.label} style={{ background: '#F5F5F5', borderRadius: 10, padding: '7px 12px' }}>
                        <p style={{ fontSize: 10, color: '#A2A2A2', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F1026', marginTop: 2 }}>{formatCOP(item.value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {emp.socialContributions.length === 0 && (
                <div style={{ background: 'white', borderRadius: 16, padding: '48px 20px', border: '1px solid #EFEFEF', textAlign: 'center' }}>
                  <HeartPulse size={36} style={{ margin: '0 auto 12px', color: '#E8E8E8' }} />
                  <p style={{ color: '#BBBBBB', fontSize: 14 }}>No hay aportes registrados aún</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
