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

  const isAdmin = user?.role === 'ADMIN'
  const isOwner = payPeriod.employeeId === user?.employeeId
  const isClientOfEmployee = user?.role === 'CLIENT' && payPeriod.employee.companyId === user?.companyId

  if (!isAdmin && !isOwner && !isClientOfEmployee) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const formatCOP = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)
  const formatDate = (d: Date) => new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(d))

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="color-scheme" content="light">
<title>Colilla de Pago — ${payPeriod.periodLabel}</title>
<style>
  :root { color-scheme: light; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; background: #f5f5f8; color: #323232; }
  .page { max-width: 700px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .header { background: #4429A6; color: white; padding: 28px 32px; }
  .badge { display: inline-block; background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 11px; margin-top: 10px; letter-spacing: 0.03em; }
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
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 299.48" style="height:38px; display:block;">
          <path fill="#fff" d="m15,212.4h15.74c1.5,0,3.29-.96,5.37-2.87,2.08-1.92,3.29-3.62,3.63-5.12l9.49-52.73c1.83-9.99,7.29-18.74,16.37-26.24,9.08-7.5,18.61-11.25,28.61-11.25h15.74v36.99h-13.99c-2,0-4.21.87-6.62,2.62-2.41,1.75-3.79,3.62-4.12,5.62l-9.5,53.22c-1.17,7-4.59,13.5-10.25,19.49-9.83,10.66-20.41,16.41-31.73,17.24-2,.16-8.25.25-18.74.25v-37.23Z"/>
          <path fill="#fff" d="m118.95,66.97h36.73v46.73h17.99v36.98h-17.99v55.25c0,1.16.58,2.41,1.75,3.73,1.16,1.33,2.33,1.99,3.5,1.99h14.99v36.98h-17.49c-2.33,0-5.17-.5-8.49-1.5-15.16-4.5-24.99-14.41-29.49-29.73-1-3.5-1.5-6.66-1.5-9.5V66.97Z"/>
          <path fill="#fff" d="m281.37,241.39c-9.99,4.83-20.07,7.25-30.23,7.25-18.33,0-33.99-6.56-46.98-19.69-12.99-13.13-19.49-28.89-19.49-47.28s6.54-34.32,19.62-47.28c13.08-12.96,28.86-19.44,47.35-19.44,13.83,0,26.53,4.04,38.11,12.12,11.58,8.08,19.7,18.61,24.36,31.61,2.67,7.5,4,13.75,4,18.74v71.21h-36.73v-7.25Zm-59.97-59.72c0,8.17,2.96,15.2,8.87,21.11,5.91,5.92,12.95,8.87,21.11,8.87s15.2-2.96,21.11-8.87c5.91-5.91,8.87-12.95,8.87-21.11s-2.92-14.95-8.75-20.87c-5.83-5.91-12.83-8.87-20.99-8.87s-15.24,2.87-21.24,8.62c-6,5.75-9,12.78-9,21.11Z"/>
          <path fill="#fff" d="m384.06,114.7v36.73h-13.99c-2.17,0-3.71.79-4.62,2.37-.92,1.59-1.37,2.46-1.37,2.62v92.21h-36.99v-91.21c0-9.66,3.04-18.32,9.12-25.99,6.08-7.66,13.87-12.83,23.36-15.49,3-.83,5.83-1.25,8.49-1.25h15.99Z"/>
          <path fill="#fff" d="m425.44,212.4h15.74c1.5,0,3.29-.96,5.37-2.87,2.08-1.92,3.29-3.62,3.63-5.12l9.49-52.73c1.83-9.99,7.29-18.74,16.37-26.24,9.08-7.5,18.61-11.25,28.61-11.25h15.74v36.99h-13.99c-2,0-4.21.87-6.62,2.62-2.41,1.75-3.79,3.62-4.12,5.62l-9.5,53.22c-1.17,7-4.59,13.5-10.25,19.49-9.83,10.66-20.41,16.41-31.73,17.24-2,.16-8.25.25-18.74.25v-37.23Z"/>
          <path fill="#fff" d="m531.39,215.4v-39.23c0-5.5.08-23.65.25-54.47v-54.47h36.73v52.97c2.33-.87,5.62-2,9.87-3.4,4.25-1.4,9.45-2.09,15.62-2.09,24.99,0,43.56,11.1,55.72,33.3,4.83,8.85,7.25,17.86,7.25,27.03v73.6h-36.73v-71.72c0-.33-.33-2.5-1-6.5-1.66-5.5-4.83-9.99-9.5-13.49s-9.83-5.25-15.49-5.25-11.04,1.75-15.62,5.25c-4.59,3.5-7.71,8.08-9.37,13.74-.17.67-.42,1.92-.75,3.75v74.21h-36.73l-.25-7.5v-25.73Z"/>
          <rect fill="#fff" x="675.07" y="114.19" width="36.73" height="134.44"/>
          <path fill="#fff" d="m797,114.94c13.16,0,25.11,3.58,35.86,10.73,10.74,7.16,18.7,16.71,23.86,28.68,3.5,8.15,5.25,15.22,5.25,21.2v73.08h-36.73v-71.03c0-1.66-.33-3.16-1-4.49-1.67-6.15-4.96-11.21-9.87-15.2-4.91-3.99-10.62-5.98-17.11-5.98s-11.91,1.91-16.74,5.73c-4.84,3.82-8.17,8.81-10,14.96-.33,1.16-.54,1.79-.62,1.87-.09.09-.29,1.54-.62,4.36v69.79h-36.73v-71.83c0-1.82.25-4.23.75-7.23,2.5-15.46,9.87-28.43,22.12-38.91,12.24-10.47,26.11-15.71,41.61-15.71Z"/>
          <path fill="#fff" d="m870.96,181.66c0-18.32,6.5-34.06,19.49-47.23,12.99-13.16,28.65-19.74,46.97-19.74,25.32,0,44.73,11.47,58.22,34.39.67,1,1.92,3.24,3.75,6.73,2.33,4.98,5,10.89,8,17.7,0,.16.08.42.25.75v.25c0,.17-.09.25-.25.25l-80.71,34.14c2.33,1.5,5.91,2.24,10.74,2.24,9.16,0,17.24-3.83,24.24-11.49h40.23v.25c-.67,3.67-2.42,8-5.25,12.99-13.49,23.49-33.4,35.23-59.72,35.23-18.16,0-33.7-6.54-46.6-19.62-12.91-13.08-19.37-28.69-19.37-46.85Zm66.97-29.99c-13,0-22.08,5.66-27.24,16.99-1.67,3.67-2.5,6.41-2.5,8.24h.25l46.48-19.49c-.16-.5-1.08-1.25-2.75-2.25-4.5-2.33-9.24-3.5-14.24-3.5Z"/>
          <path fill="#f2421a" d="m1015.05,152.87c-.75-1.78-1.66-3.51-2.22-5.35-5.8-19.15-18.82-31.19-37.14-38.23-2.74-1.05-5.1-3.07-7.64-4.65,2.53-1.22,4.98-2.71,7.61-3.63,19.76-6.92,32.58-20.39,38.59-40.39.36-1.19.63-2.41,1.02-3.59.14-.42.5-.77,1.51-2.24,6.83,25.89,22.23,42.34,48.22,49.11-25.85,7.12-41.87,23.54-48.19,49.46-.59-.16-1.18-.33-1.77-.49Z"/>
        </svg>
        <div style="margin-top:10px;">
          <span class="badge">Colilla de Pago · Employer of Record · NIT: En trámite · Barranquilla, Colombia</span>
        </div>
      </div>
      <div style="text-align:right;">
        <p style="font-size:11px; opacity:0.6; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px;">Periodo</p>
        <p style="font-size:20px; font-weight:800; letter-spacing:-0.02em;">${payPeriod.periodLabel}</p>
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

    ${(payPeriod.healthAmount || payPeriod.pensionAmount) ? `
    <p class="section-title" style="margin-top:28px;">Aportes Sociales (asumidos por Kover Solutions)</p>
    <table class="table">
      <thead>
        <tr>
          <th>Concepto</th>
          <th>Tipo</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>
        ${payPeriod.healthAmount ? `<tr><td>Salud (EPS)</td><td><span style="color:#4429A6;font-size:11px;font-weight:700;">APORTE</span></td><td>${formatCOP(payPeriod.healthAmount)}</td></tr>` : ''}
        ${payPeriod.pensionAmount ? `<tr><td>Pensión</td><td><span style="color:#4429A6;font-size:11px;font-weight:700;">APORTE</span></td><td>${formatCOP(payPeriod.pensionAmount)}</td></tr>` : ''}
      </tbody>
      <tfoot>
        <tr style="background:#F0EDFF;">
          <td colspan="2" style="padding:12px 16px;font-size:13px;font-weight:700;color:#4429A6;">COSTO TOTAL PARA KOVER</td>
          <td style="padding:12px 16px;text-align:right;font-size:15px;font-weight:800;color:#4429A6;">${formatCOP(payPeriod.netPay + (payPeriod.healthAmount || 0) + (payPeriod.pensionAmount || 0))}</td>
        </tr>
      </tfoot>
    </table>` : ''}

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
