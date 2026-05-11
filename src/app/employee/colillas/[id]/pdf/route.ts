import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const user = session?.user as any

  const { id } = await params
  const payPeriod = await prisma.payPeriod.findUnique({
    where: { id },
    include: {
      employee: { include: { company: true } },
    },
  })

  if (!payPeriod) return new NextResponse('Not found', { status: 404 })

  // Only the employee or admin can access
  if (user?.role !== 'ADMIN' && payPeriod.employeeId !== user?.employeeId) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const formatCOP = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)
  const formatDate = (d: Date) => new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(d))

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Colilla de Pago — ${payPeriod.periodLabel}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; background: #f5f5f8; color: #323232; }
  .page { max-width: 700px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #4429A6 0%, #F2421B 100%); color: white; padding: 32px; }
  .header h1 { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
  .header p { opacity: 0.7; font-size: 14px; }
  .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 8px; }
  .body { padding: 32px; }
  .section-title { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
  .info-item label { font-size: 11px; color: #888; display: block; margin-bottom: 4px; }
  .info-item value { font-size: 14px; font-weight: 600; color: #0F1026; }
  .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .table th { background: #f5f5f8; padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; }
  .table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  .table td:last-child { text-align: right; font-weight: 600; }
  .total-row { background: #4429A6; color: white; }
  .total-row td { font-size: 16px; font-weight: 800; padding: 16px; }
  .footer { background: #f5f5f8; padding: 20px 32px; text-align: center; font-size: 11px; color: #888; }
  .stamp { border: 2px dashed #4429A6; border-radius: 12px; padding: 12px 20px; display: inline-block; color: #4429A6; font-weight: 700; font-size: 13px; margin-top: 16px; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
      <div>
        <h1>⭐ Star Shine S.A.S.</h1>
        <p>Colilla de Pago — Employer of Record</p>
        <span class="badge">NIT: En trámite · Barranquilla, Colombia</span>
      </div>
      <div style="text-align:right;">
        <p style="font-size:13px; opacity:0.8;">Periodo</p>
        <p style="font-size:18px; font-weight:800;">${payPeriod.periodLabel}</p>
      </div>
    </div>
  </div>

  <div class="body">
    <p class="section-title">Información del Empleado</p>
    <div class="info-grid">
      <div class="info-item">
        <label>Nombre completo</label>
        <div style="font-size:14px; font-weight:600; color:#0F1026;">${payPeriod.employee.firstName} ${payPeriod.employee.lastName}</div>
      </div>
      <div class="info-item">
        <label>Cargo</label>
        <div style="font-size:14px; font-weight:600; color:#0F1026;">${payPeriod.employee.position}</div>
      </div>
      <div class="info-item">
        <label>Empresa cliente</label>
        <div style="font-size:14px; font-weight:600; color:#0F1026;">${payPeriod.employee.company.name}</div>
      </div>
      <div class="info-item">
        <label>Fecha de pago</label>
        <div style="font-size:14px; font-weight:600; color:#0F1026;">${payPeriod.paidAt ? formatDate(payPeriod.paidAt) : 'Pendiente'}</div>
      </div>
      <div class="info-item">
        <label>Periodo inicio</label>
        <div style="font-size:14px; font-weight:600; color:#0F1026;">${formatDate(payPeriod.periodStart)}</div>
      </div>
      <div class="info-item">
        <label>Periodo fin</label>
        <div style="font-size:14px; font-weight:600; color:#0F1026;">${formatDate(payPeriod.periodEnd)}</div>
      </div>
    </div>

    <p class="section-title">Conceptos de Pago</p>
    <table class="table">
      <thead>
        <tr>
          <th>Concepto</th>
          <th>Tipo</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Salario Base</td>
          <td><span style="color:green;font-size:11px;font-weight:700;">DEVENGADO</span></td>
          <td>${formatCOP(payPeriod.baseSalary)}</td>
        </tr>
        ${payPeriod.conectividad > 0 ? `<tr><td>Auxilio de Conectividad</td><td><span style="color:green;font-size:11px;font-weight:700;">DEVENGADO</span></td><td>${formatCOP(payPeriod.conectividad)}</td></tr>` : ''}
        ${payPeriod.tools > 0 ? `<tr><td>Herramientas de Trabajo</td><td><span style="color:green;font-size:11px;font-weight:700;">DEVENGADO</span></td><td>${formatCOP(payPeriod.tools)}</td></tr>` : ''}
        ${payPeriod.bonus > 0 ? `<tr><td>Bono</td><td><span style="color:green;font-size:11px;font-weight:700;">DEVENGADO</span></td><td>${formatCOP(payPeriod.bonus)}</td></tr>` : ''}
        ${payPeriod.otherAdd > 0 ? `<tr><td>${payPeriod.otherAddNote || 'Otros devengados'}</td><td><span style="color:green;font-size:11px;font-weight:700;">DEVENGADO</span></td><td>${formatCOP(payPeriod.otherAdd)}</td></tr>` : ''}
        ${payPeriod.deductions > 0 ? `<tr><td>${payPeriod.deductionNote || 'Descuentos'}</td><td><span style="color:red;font-size:11px;font-weight:700;">DEDUCCIÓN</span></td><td>-${formatCOP(payPeriod.deductions)}</td></tr>` : ''}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="2">TOTAL NETO A PAGAR</td>
          <td>${formatCOP(payPeriod.netPay)}</td>
        </tr>
      </tfoot>
    </table>

    ${payPeriod.notes ? `<div style="background:#f5f5f8;padding:16px;border-radius:12px;margin-bottom:24px;"><p style="font-size:11px;color:#888;font-weight:700;margin-bottom:4px;">NOTAS</p><p style="font-size:13px;">${payPeriod.notes}</p></div>` : ''}

    <div style="text-align:center;">
      <div class="stamp">✓ PAGO REALIZADO VÍA TRANSFERENCIA BANCARIA</div>
      <p style="margin-top:12px;font-size:11px;color:#888;">Este documento es un comprobante de pago emitido por Star Shine S.A.S.</p>
    </div>
  </div>

  <div class="footer">
    <p>Star Shine S.A.S. · Barranquilla, Colombia · Starshine07@gmail.com · Tel: 3052912267</p>
    <p style="margin-top:4px;">Generado el ${formatDate(new Date())} · Polaris App</p>
  </div>
</div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
