import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const user = session?.user as any

  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const formData = await req.formData()
  const action = formData.get('action') as string

  await prisma.leaveRequest.update({
    where: { id },
    data: { status: action },
  })

  return NextResponse.redirect(new URL('/admin/incapacidades', req.url))
}
