/**
 * Repara la tabla Income:
 *   1. Elimina los duplicados exactos que dejó correr el seed varias veces.
 *   2. Crea el Income faltante de cada cuenta de cobro ya marcada como pagada.
 *
 * Por defecto SIMULA. Para aplicar de verdad:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/reparar-ingresos.ts --apply
 */
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve(process.cwd(), '.env')
for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) {
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    process.env[m[1]] = v
  }
}

const prisma = new PrismaClient()
const APLICAR = process.argv.includes('--apply')
const cop = (n: number) => '$ ' + new Intl.NumberFormat('es-CO').format(Math.round(n))

async function main() {
  console.log(APLICAR ? '=== MODO REAL: se van a aplicar cambios ===\n' : '=== SIMULACIÓN (no se toca nada) ===\n')

  // ── 1. Duplicados de Income ───────────────────────────────────────────
  const incomes = await prisma.income.findMany({ orderBy: { createdAt: 'asc' } })
  const vistos = new Map<string, string>()
  const aBorrar: typeof incomes = []

  for (const i of incomes) {
    // Misma empresa + misma fecha + mismo monto + misma descripción = duplicado
    const clave = [i.companyId, i.date.toISOString(), i.amountCOP, i.description ?? ''].join('|')
    if (vistos.has(clave)) aBorrar.push(i)
    else vistos.set(clave, i.id)
  }

  console.log(`1) DUPLICADOS`)
  console.log(`   Income actuales: ${incomes.length} — total ${cop(incomes.reduce((s, i) => s + i.amountCOP, 0))}`)
  if (aBorrar.length === 0) {
    console.log('   No hay duplicados.')
  } else {
    console.log(`   Se eliminarían ${aBorrar.length}:`)
    for (const d of aBorrar) {
      console.log(`     - ${d.date.toISOString().slice(0, 10)} | ${cop(d.amountCOP)} | ${d.description ?? ''}`)
    }
    if (APLICAR) {
      // Nunca borrar uno que ya esté vinculado a un pago o a una factura
      const seguros: string[] = []
      for (const d of aBorrar) {
        const cp = await prisma.clientPayment.findFirst({ where: { incomeId: d.id }, select: { id: true } })
        const si = await prisma.serviceInvoice.findFirst({ where: { incomeId: d.id }, select: { id: true } })
        if (cp || si) console.log(`     (se conserva ${d.id}: está vinculado)`)
        else seguros.push(d.id)
      }
      const r = await prisma.income.deleteMany({ where: { id: { in: seguros } } })
      console.log(`   → ${r.count} eliminados.`)
    }
  }

  // ── 2. Cuentas de cobro pagadas sin Income ────────────────────────────
  const pagadas = await prisma.serviceInvoice.findMany({
    where: { status: 'PAID', incomeId: null },
    include: { company: { select: { name: true } } },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`\n2) CUENTAS DE COBRO PAGADAS SIN INGRESO`)
  if (pagadas.length === 0) {
    console.log('   Ninguna. Todo cuadra.')
  } else {
    let suma = 0
    for (const f of pagadas) {
      const monto = f.receivedAmountCOP ?? f.total
      suma += monto
      const origen = f.receivedAmountCOP != null ? 'recibido' : 'total facturado (no se registró el recibido)'
      console.log(`     + ${f.invoiceNumber ?? f.period} | ${f.company.name} | ${cop(monto)} (${origen})`)
    }
    console.log(`   Se crearían ${pagadas.length} ingresos por ${cop(suma)}`)

    if (APLICAR) {
      for (const f of pagadas) {
        const monto = f.receivedAmountCOP ?? f.total
        const fecha = f.receivedAt ?? f.paidAt ?? f.invoiceDate ?? f.createdAt
        const trm = f.sentAmountUSD && f.sentAmountUSD > 0 ? monto / f.sentAmountUSD : null
        await prisma.$transaction(async (tx) => {
          const inc = await tx.income.create({
            data: {
              companyId: f.companyId,
              date: fecha,
              amountCOP: monto,
              amountUSD: f.sentAmountUSD,
              exchangeRate: trm,
              platform: 'WISE',
              description: `Cuenta de cobro ${f.invoiceNumber ?? f.period} — ${f.company.name}`,
            },
            select: { id: true },
          })
          await tx.serviceInvoice.update({ where: { id: f.id }, data: { incomeId: inc.id } })
        })
      }
      console.log(`   → ${pagadas.length} ingresos creados y vinculados.`)
    }
  }

  // ── 3. Resultado ──────────────────────────────────────────────────────
  const final = await prisma.income.findMany({ include: { company: { select: { name: true } } } })
  const porCliente = new Map<string, number>()
  for (const i of final) porCliente.set(i.company.name, (porCliente.get(i.company.name) ?? 0) + i.amountCOP)

  console.log(`\n3) TOTAL DE INGRESOS ${APLICAR ? '(ya aplicado)' : '(si se aplicara)'}`)
  if (!APLICAR) {
    const restados = aBorrar.reduce((s, d) => s + d.amountCOP, 0)
    const sumados = pagadas.reduce((s, f) => s + (f.receivedAmountCOP ?? f.total), 0)
    const actual = final.reduce((s, i) => s + i.amountCOP, 0)
    console.log(`   Hoy:      ${cop(actual)}`)
    console.log(`   Quedaría: ${cop(actual - restados + sumados)}`)
  } else {
    for (const [nombre, total] of porCliente) console.log(`   ${nombre}: ${cop(total)}`)
    console.log(`   TOTAL: ${cop(final.reduce((s, i) => s + i.amountCOP, 0))}`)
  }
}

main().catch((e) => console.error('ERROR:', e.message)).finally(() => prisma.$disconnect())
