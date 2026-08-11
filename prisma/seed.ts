import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10)
  const clientPassword = await bcrypt.hash('kover123', 10)
  const employeePassword = await bcrypt.hash('justine123', 10)

  // Admin user (Star Shine)
  await prisma.user.upsert({
    where: { email: 'admin@starshine.co' },
    update: {},
    create: {
      email: 'admin@starshine.co',
      password: adminPassword,
      name: 'Star Shine Admin',
      role: 'ADMIN',
    },
  })

  // Company: Kover Solutions
  const kover = await prisma.company.upsert({
    where: { id: 'kover-solutions' },
    update: {},
    create: {
      id: 'kover-solutions',
      name: 'Kover Solutions',
      country: 'US',
      currency: 'USD',
      contactName: 'Kover Admin',
      contactEmail: 'admin@koversolutions.com',
    },
  })

  // Employee: Justine
  const justine = await prisma.employee.upsert({
    where: { email: 'justine@koversolutions.com' },
    update: {
      lastName: 'Escamilla',
      salary: 1150000,
      conectividadDefault: 200000,
      toolsDefault: 99900,
    },
    create: {
      firstName: 'Justine',
      lastName: 'Escamilla',
      email: 'justine@koversolutions.com',
      position: 'Asistente Administrativa y Financiera',
      startDate: new Date('2026-01-15'),
      salary: 1150000,
      conectividadDefault: 200000,
      toolsDefault: 99900,
      companyId: kover.id,
    },
  })

  // Client user
  await prisma.user.upsert({
    where: { email: 'admin@koversolutions.com' },
    update: {},
    create: {
      email: 'admin@koversolutions.com',
      password: clientPassword,
      name: 'Kover Admin',
      role: 'CLIENT',
      companyId: kover.id,
    },
  })

  // Employee user
  await prisma.user.upsert({
    where: { email: 'justine@koversolutions.com' },
    update: { name: 'Justine Escamilla' },
    create: {
      email: 'justine@koversolutions.com',
      password: employeePassword,
      name: 'Justine Escamilla',
      role: 'EMPLOYEE',
      employeeId: justine.id,
    },
  })

  // Sample pay periods
  const periods = [
    { label: '1-15 Enero 2026', start: '2026-01-01', end: '2026-01-15', base: 900000, conectividad: 100000, tools: 99900, net: 1099900 },
    { label: '16-31 Enero 2026', start: '2026-01-16', end: '2026-01-31', base: 900000, conectividad: 100000, tools: 73000, net: 1073000 },
    { label: '1-15 Feb 2026', start: '2026-02-01', end: '2026-02-15', base: 900000, conectividad: 200000, tools: 99900, net: 1199900 },
    { label: '16-28 Feb 2026', start: '2026-02-16', end: '2026-02-28', base: 900000, conectividad: 200000, tools: 73000, net: 1173000 },
    { label: '1-15 Mar 2026', start: '2026-03-01', end: '2026-03-15', base: 1150000, conectividad: 200000, tools: 99900, net: 1449900 },
    { label: '16-31 Mar 2026', start: '2026-03-16', end: '2026-03-31', base: 1150000, conectividad: 200000, tools: 99900, net: 1449900 },
  ]

  for (const p of periods) {
    await prisma.payPeriod.create({
      data: {
        periodStart: new Date(p.start),
        periodEnd: new Date(p.end),
        periodLabel: p.label,
        baseSalary: p.base,
        conectividad: p.conectividad,
        tools: p.tools,
        netPay: p.net,
        status: 'PAID',
        paidAt: new Date(p.end),
        employeeId: justine.id,
      },
    })
  }

  // Social contributions
  const contribs = [
    { period: 'Enero 2026', health: 74100, pension: 144000, arl: 10400, caja: 24600, total: 253100 },
    { period: 'Febrero 2026', health: 148200, pension: 144000, arl: 10400, caja: 24600, lateFee: 143800, total: 471000 },
    { period: 'Marzo 2026', health: 148200, pension: 144000, arl: 10400, caja: 24600, lateFee: 137900, total: 465100 },
  ]

  for (const c of contribs) {
    await prisma.socialContribution.create({
      data: {
        period: c.period,
        health: c.health,
        pension: c.pension,
        arl: c.arl,
        caja: c.caja,
        lateFee: c.lateFee || 0,
        total: c.total,
        status: 'PAID',
        paidAt: new Date('2026-04-01'),
        employeeId: justine.id,
      },
    })
  }

  // Incomes from Kover
  await prisma.income.createMany({
    data: [
      { date: new Date('2026-01-15'), amountUSD: 750, amountCOP: 1487512, exchangeRate: 1983.3, platform: 'WISE', description: 'Pago enero Q1', companyId: kover.id },
      { date: new Date('2026-01-15'), amountUSD: 750, amountCOP: 1487512, exchangeRate: 1983.3, platform: 'WISE', description: 'Pago enero Q2', companyId: kover.id },
    ],
  })

  // Service invoices
  await prisma.serviceInvoice.createMany({
    data: [
      { period: 'Enero 2026', baseAmount: 200000, iva: 0, total: 200000, status: 'PAID', companyId: kover.id },
      { period: 'Febrero 2026', baseAmount: 150000, iva: 0, total: 150000, status: 'PAID', companyId: kover.id },
      { period: 'Marzo 2026', baseAmount: 150000, iva: 0, total: 150000, status: 'PAID', companyId: kover.id },
      { period: 'Abril 2026', baseAmount: 150000, iva: 28500, total: 178500, status: 'PENDING', companyId: kover.id },
    ],
  })

  console.log('Seed completed!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
