'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export async function createPayPeriod(data: {
  employeeId: string
  quincena: '1' | '2'
  month: string
  year: string
  baseSalary: string
  conectividad: string
  tools: string
  bonus: string
  otherAdd: string
  otherAddNote?: string
  deductions: string
  deductionNote?: string
  healthAmount?: string
  pensionAmount?: string
  status: string
  paidAt?: string
  notes?: string
}): Promise<{ success: boolean }> {
  const month = parseInt(data.month)
  const year = parseInt(data.year)
  const baseSalary = parseFloat(data.baseSalary) || 0
  const conectividad = parseFloat(data.conectividad) || 0
  const tools = parseFloat(data.tools) || 0
  const bonus = parseFloat(data.bonus) || 0
  const otherAdd = parseFloat(data.otherAdd) || 0
  const deductions = parseFloat(data.deductions) || 0
  const healthAmount = data.healthAmount ? parseFloat(data.healthAmount) || null : null
  const pensionAmount = data.pensionAmount ? parseFloat(data.pensionAmount) || null : null
  const netPay = baseSalary + conectividad + tools + bonus + otherAdd - deductions

  const mesNombre = MESES[month - 1]

  let periodStart: Date
  let periodEnd: Date
  let periodLabel: string

  if (data.quincena === '1') {
    periodStart = new Date(year, month - 1, 1)
    periodEnd = new Date(year, month - 1, 15)
    periodLabel = `1-15 ${mesNombre} ${year}`
  } else {
    periodStart = new Date(year, month - 1, 16)
    periodEnd = new Date(year, month, 0)
    periodLabel = `16-${periodEnd.getDate()} ${mesNombre} ${year}`
  }

  await prisma.payPeriod.create({
    data: {
      periodStart,
      periodEnd,
      periodLabel,
      baseSalary,
      conectividad,
      tools,
      bonus,
      otherAdd,
      otherAddNote: data.otherAddNote || null,
      deductions,
      deductionNote: data.deductionNote || null,
      healthAmount,
      pensionAmount,
      netPay,
      status: data.status,
      paidAt: data.paidAt ? new Date(data.paidAt) : null,
      notes: data.notes || null,
      employeeId: data.employeeId,
    },
  })

  revalidatePath('/admin/nomina')
  return { success: true }
}
