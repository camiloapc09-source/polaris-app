import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

// Cargar .env manualmente (este script se corre con ts-node directo, no via prisma CLI)
const envPath = path.resolve(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) {
      let v = m[2].trim()
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
      process.env[m[1]] = v
    }
  }
}

const prisma = new PrismaClient()

const D = (s: string) => new Date(s) // ISO -> UTC, igual que el seed

// --- Nómina (PayPeriod) — valores exactos de los soportes ---
const payPeriods = [
  { label: '1-15 Abril 2026',  start: '2026-04-01', end: '2026-04-15', base: 1150000, conectividad: 0,      tools: 0,      net: 1150000, paidAt: '2026-04-13', support: 'https://drive.google.com/file/d/18gEu0fInez2UTzaY67YiUtvejpGF5dPa/view' },
  { label: '16-30 Abril 2026', start: '2026-04-16', end: '2026-04-30', base: 1150000, conectividad: 200000, tools: 99900,  net: 1449900, paidAt: '2026-04-24', support: 'https://drive.google.com/file/d/1J-lSs2f17Sj7-zshHocxh7c6hAR20Kdk/view' },
  { label: '1-15 Mayo 2026',   start: '2026-05-01', end: '2026-05-15', base: 1150000, conectividad: 0,      tools: 0,      net: 1150000, paidAt: '2026-05-14', support: 'https://drive.google.com/file/d/1-riwotPzRw7VkJfwd7v798oZpx0vpg6Z/view' },
  { label: '16-31 Mayo 2026',  start: '2026-05-16', end: '2026-05-31', base: 1150000, conectividad: 200000, tools: 148995, net: 1498995, paidAt: '2026-05-29', support: 'https://drive.google.com/file/d/10FssMzZUYqEBW6XU3JOxrKEkdQ2y1TFm/view' },
  { label: '1-15 Junio 2026',  start: '2026-06-01', end: '2026-06-15', base: 1150000, conectividad: 0,      tools: 0,      net: 1150000, paidAt: '2026-06-12', support: 'https://drive.google.com/file/d/1nqYirf2cUfFUatoSuPSQrZTzEl5PT94W/view' },
]

// --- Aportes (SocialContribution) — valores exactos de los comprobantes PILA ---
const aportes = [
  { period: '2026-04', health: 70100, pension: 280200, arl: 42700, caja: 70100, lateFee: 3000, total: 466100, paidAt: '2026-05-14', voucher: 'https://drive.google.com/file/d/1tKk8iuMgIFqIRW7Y7lnfdL7AErOgOxez/view' },
  { period: '2026-05', health: 70100, pension: 280200, arl: 42700, caja: 70100, lateFee: 3200, total: 466300, paidAt: '2026-06-12', voucher: 'https://drive.google.com/file/d/1wnfxAIAuVhgI482T5mrWC3mYo5vBLClI/view' },
]

async function main() {
  const justine = await prisma.employee.findUnique({ where: { email: 'justine@koversolutions.com' } })
  if (!justine) throw new Error('No se encontró a Justine (justine@koversolutions.com)')

  console.log(`Empleada: ${justine.firstName} ${justine.lastName} (${justine.id})\n`)

  // Nómina
  for (const p of payPeriods) {
    const exists = await prisma.payPeriod.findFirst({ where: { employeeId: justine.id, periodLabel: p.label } })
    if (exists) { console.log(`SKIP nómina (ya existe): ${p.label}`); continue }
    await prisma.payPeriod.create({
      data: {
        periodStart: D(p.start), periodEnd: D(p.end), periodLabel: p.label,
        baseSalary: p.base, conectividad: p.conectividad, tools: p.tools,
        bonus: 0, otherAdd: 0, deductions: 0,
        netPay: p.net, status: 'PAID', paidAt: D(p.paidAt),
        supportUrl: p.support, employeeId: justine.id,
      },
    })
    console.log(`OK   nómina: ${p.label} -> ${p.net.toLocaleString('es-CO')}`)
  }

  // Aportes
  for (const a of aportes) {
    const exists = await prisma.socialContribution.findFirst({ where: { employeeId: justine.id, period: a.period } })
    if (exists) { console.log(`SKIP aporte (ya existe): ${a.period}`); continue }
    await prisma.socialContribution.create({
      data: {
        employeeId: justine.id, period: a.period,
        health: a.health, pension: a.pension, arl: a.arl, caja: a.caja, lateFee: a.lateFee, total: a.total,
        status: 'PAID', paidAt: D(a.paidAt), voucherUrl: a.voucher,
      },
    })
    console.log(`OK   aporte: ${a.period} -> ${a.total.toLocaleString('es-CO')}`)
  }

  console.log('\nCarga completada.')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
