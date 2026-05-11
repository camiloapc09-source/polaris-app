import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  const user = session?.user as any

  if (!user?.employeeId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { type, startDate, endDate, days, description } = body

  if (!startDate || !endDate || !days) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const leave = await prisma.leaveRequest.create({
    data: {
      employeeId: user.employeeId,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      days: parseInt(days),
      description,
      status: 'PENDING',
    },
  })

  return NextResponse.json(leave)
}
