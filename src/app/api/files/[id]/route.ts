import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const file = await prisma.uploadedFile.findUnique({ where: { id } })
  if (!file) {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
  }

  const body = new Uint8Array(file.data)

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': file.mimeType,
      'Content-Length': String(file.size),
      'Content-Disposition': `inline; filename="${encodeURIComponent(file.filename)}"`,
      'Cache-Control': 'private, max-age=31536000, immutable',
    },
  })
}
