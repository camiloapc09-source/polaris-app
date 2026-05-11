/**
 * Migra datos de SQLite (dev.db) → Neon PostgreSQL
 * Uso: node scripts/migrate-to-neon.mjs
 *
 * Requiere: NODE_ENV != production y dev.db presente en prisma/
 */
import { DatabaseSync } from 'node:sqlite'
import pg from 'pg'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const NEON_URL =
  'postgresql://neondb_owner:npg_1zUoJm4XatLF@ep-lively-hill-ajxfei7d-pooler.c-3.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require'

const db = new DatabaseSync(path.join(ROOT, 'prisma', 'dev.db'))
const { Pool } = pg
const pool = new Pool({ connectionString: NEON_URL })

function ts(v) {
  if (!v) return null
  if (typeof v === 'number') return new Date(v).toISOString()
  return v
}

async function main() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    console.log('Conectado a Neon. Iniciando migración...\n')

    // ── Company ──────────────────────────────────────────
    const companies = db.prepare('SELECT * FROM Company').all()
    for (const c of companies) {
      await client.query(`
        INSERT INTO "Company" (id, name, country, currency, "contactName", "contactEmail", "logoUrl", "createdAt", "updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (id) DO NOTHING
      `, [c.id, c.name, c.country, c.currency, c.contactName, c.contactEmail, c.logoUrl, ts(c.createdAt), ts(c.updatedAt)])
    }
    console.log(`✓ Company: ${companies.length} registros`)

    // ── Employee ─────────────────────────────────────────
    const employees = db.prepare('SELECT * FROM Employee').all()
    for (const e of employees) {
      await client.query(`
        INSERT INTO "Employee" (id, "firstName", "lastName", email, phone, position, "startDate", salary, status, "avatarUrl", "bankAccount", "bankName", cedula, "conectividadDefault", "toolsDefault", "companyId", "createdAt", "updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        ON CONFLICT (id) DO NOTHING
      `, [e.id, e.firstName, e.lastName, e.email, e.phone, e.position, ts(e.startDate), e.salary, e.status, e.avatarUrl, e.bankAccount, e.bankName, e.cedula, e.conectividadDefault, e.toolsDefault, e.companyId, ts(e.createdAt), ts(e.updatedAt)])
    }
    console.log(`✓ Employee: ${employees.length} registros`)

    // ── User ─────────────────────────────────────────────
    const users = db.prepare('SELECT * FROM User').all()
    for (const u of users) {
      await client.query(`
        INSERT INTO "User" (id, email, password, name, role, avatar, "companyId", "employeeId", "createdAt", "updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (id) DO NOTHING
      `, [u.id, u.email, u.password, u.name, u.role, u.avatar, u.companyId, u.employeeId, ts(u.createdAt), ts(u.updatedAt)])
    }
    console.log(`✓ User: ${users.length} registros`)

    // ── Income ───────────────────────────────────────────
    const incomes = db.prepare('SELECT * FROM Income').all()
    for (const i of incomes) {
      await client.query(`
        INSERT INTO "Income" (id, date, "amountUSD", "amountCOP", "exchangeRate", platform, description, "supportUrl", "companyId", "createdAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (id) DO NOTHING
      `, [i.id, ts(i.date), i.amountUSD, i.amountCOP, i.exchangeRate, i.platform, i.description, i.supportUrl, i.companyId, ts(i.createdAt)])
    }
    console.log(`✓ Income: ${incomes.length} registros`)

    // ── PayPeriod ────────────────────────────────────────
    const payPeriods = db.prepare('SELECT * FROM PayPeriod').all()
    for (const p of payPeriods) {
      await client.query(`
        INSERT INTO "PayPeriod" (id, "periodStart", "periodEnd", "periodLabel", "baseSalary", conectividad, tools, bonus, "otherAdd", "otherAddNote", deductions, "deductionNote", "netPay", status, "paidAt", "supportUrl", notes, "employeeId", "createdAt", "updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
        ON CONFLICT (id) DO NOTHING
      `, [p.id, ts(p.periodStart), ts(p.periodEnd), p.periodLabel, p.baseSalary, p.conectividad, p.tools, p.bonus, p.otherAdd, p.otherAddNote, p.deductions, p.deductionNote, p.netPay, p.status, ts(p.paidAt), p.supportUrl, p.notes, p.employeeId, ts(p.createdAt), ts(p.updatedAt)])
    }
    console.log(`✓ PayPeriod: ${payPeriods.length} registros`)

    // ── SocialContribution ───────────────────────────────
    const contribs = db.prepare('SELECT * FROM SocialContribution').all()
    for (const c of contribs) {
      await client.query(`
        INSERT INTO "SocialContribution" (id, period, health, pension, arl, caja, "lateFee", total, status, "paidAt", "voucherUrl", "employeeId", "createdAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        ON CONFLICT (id) DO NOTHING
      `, [c.id, c.period, c.health, c.pension, c.arl, c.caja, c.lateFee, c.total, c.status, ts(c.paidAt), c.voucherUrl, c.employeeId, ts(c.createdAt)])
    }
    console.log(`✓ SocialContribution: ${contribs.length} registros`)

    // ── ServiceInvoice ───────────────────────────────────
    const invoices = db.prepare('SELECT * FROM ServiceInvoice').all()
    for (const i of invoices) {
      await client.query(`
        INSERT INTO "ServiceInvoice" (id, period, "baseAmount", iva, total, "invoiceRef", status, "paidAt", "companyId", "createdAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (id) DO NOTHING
      `, [i.id, i.period, i.baseAmount, i.iva, i.total, i.invoiceRef, i.status, ts(i.paidAt), i.companyId, ts(i.createdAt)])
    }
    console.log(`✓ ServiceInvoice: ${invoices.length} registros`)

    // ── LeaveRequest ─────────────────────────────────────
    const leaves = db.prepare('SELECT * FROM LeaveRequest').all()
    for (const l of leaves) {
      await client.query(`
        INSERT INTO "LeaveRequest" (id, type, "startDate", "endDate", days, description, "documentUrl", status, "reviewNote", "employeeId", "createdAt", "updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT (id) DO NOTHING
      `, [l.id, l.type, ts(l.startDate), ts(l.endDate), l.days, l.description, l.documentUrl, l.status, l.reviewNote, l.employeeId, ts(l.createdAt), ts(l.updatedAt)])
    }
    console.log(`✓ LeaveRequest: ${leaves.length} registros`)

    // ── CertificadoLaboral ───────────────────────────────
    const certs = db.prepare('SELECT * FROM CertificadoLaboral').all()
    for (const c of certs) {
      await client.query(`
        INSERT INTO "CertificadoLaboral" (id, type, status, "requestNote", "adminNote", "documentUrl", "employeeId", "createdAt", "updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (id) DO NOTHING
      `, [c.id, c.type, c.status, c.requestNote, c.adminNote, c.documentUrl, c.employeeId, ts(c.createdAt), ts(c.updatedAt)])
    }
    console.log(`✓ CertificadoLaboral: ${certs.length} registros`)

    // ── ExamenMedico ─────────────────────────────────────
    const exams = db.prepare('SELECT * FROM ExamenMedico').all()
    for (const e of exams) {
      await client.query(`
        INSERT INTO "ExamenMedico" (id, type, "examDate", "nextExamDate", clinic, result, "evidenceUrl", notes, "employeeId", "createdAt", "updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT (id) DO NOTHING
      `, [e.id, e.type, ts(e.examDate), ts(e.nextExamDate), e.clinic, e.result, e.evidenceUrl, e.notes, e.employeeId, ts(e.createdAt), ts(e.updatedAt)])
    }
    console.log(`✓ ExamenMedico: ${exams.length} registros`)

    // ── ProgramaBienestar ────────────────────────────────
    const programs = db.prepare('SELECT * FROM ProgramaBienestar').all()
    for (const p of programs) {
      await client.query(`
        INSERT INTO "ProgramaBienestar" (id, title, category, description, provider, schedule, capacity, "isActive", "imageUrl", "companyId", "createdAt", "updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT (id) DO NOTHING
      `, [p.id, p.title, p.category, p.description, p.provider, p.schedule, p.capacity, p.isActive === 1, p.imageUrl, p.companyId, ts(p.createdAt), ts(p.updatedAt)])
    }
    console.log(`✓ ProgramaBienestar: ${programs.length} registros`)

    // ── InscripcionBienestar ─────────────────────────────
    const inscripciones = db.prepare('SELECT * FROM InscripcionBienestar').all()
    for (const i of inscripciones) {
      await client.query(`
        INSERT INTO "InscripcionBienestar" (id, status, "programaId", "employeeId", "createdAt")
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT (id) DO NOTHING
      `, [i.id, i.status, i.programaId, i.employeeId, ts(i.createdAt)])
    }
    console.log(`✓ InscripcionBienestar: ${inscripciones.length} registros`)

    await client.query('COMMIT')
    console.log('\n🎉 Migración completada exitosamente.')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('\n❌ Error en la migración:', err.message)
    process.exit(1)
  } finally {
    client.release()
    db.close()
    await pool.end()
  }
}

main()
