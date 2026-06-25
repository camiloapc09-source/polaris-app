import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const saved = await prisma.uploadedFile.create({
    data: {
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: buffer.length,
      data: buffer,
    },
    select: { id: true },
  })

  return NextResponse.json({ url: `/api/files/${saved.id}` })
}
