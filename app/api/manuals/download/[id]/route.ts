import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DiffSync } from '@/lib/diffSync'
import fs from 'fs/promises'
import path from 'path'


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
console.log('🚀 ЗАПРОС ПОЛУЧЕН')
  const { id } = await params
  const manual = await prisma.manual.findUnique({ where: { id: parseInt(id) } })
  if (!manual?.localPath) {
    return NextResponse.json({ error: 'Файл не найден' }, { status: 404 })
    
  }
console.log('Отправляю заголовки:', {
  fileHash: manual.fileHash,
  chunksHash: manual.chunksHash?.substring(0, 20)
})
  const clientVersion = parseInt(req.headers.get('x-file-version') || '0')
  const clientHash = req.headers.get('x-file-hash')

  if (clientVersion === manual.version && clientHash === manual.fileHash) {
    return new NextResponse(null, { status: 304 })
  }

  const buffer = await fs.readFile(manual.localPath)

  if (req.headers.get('x-chunks-hash') && manual.chunksHash) {
    const clientChunks = JSON.parse(req.headers.get('x-chunks-hash')!)
    const serverChunks = JSON.parse(manual.chunksHash)
    const changedChunks = DiffSync.diff(clientChunks, serverChunks)
    const diffData = DiffSync.getChunks(buffer, changedChunks)

    const diffPackage = JSON.stringify({
      version: manual.version,
      fileHash: manual.fileHash,
      changedChunks: Array.from(diffData.entries()).map(([index, data]) => ({
        index,
        data: data.toString('base64')
      }))
    })

    return new NextResponse(diffPackage, {
      headers: {
        'Content-Type': 'application/json',
        'X-File-Version': manual.version.toString(),
        'X-File-Hash': manual.fileHash!,
        'X-Diff-Applied': 'true'
      }
    })
  }
console.log('Отправляю заголовки:', {
  fileHash: manual.fileHash,
  chunksHash: manual.chunksHash?.substring(0, 20)
})
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${manual.title}.pdf"`,
      'X-File-Version': manual.version.toString(),
      'X-File-Hash': manual.fileHash!,
      'X-Chunks-Hash': manual.chunksHash!,
      'Cache-Control': 'no-cache'
    }
  })
}