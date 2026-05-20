import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DiffSync } from '@/lib/diffSync'
import jwt from 'jsonwebtoken'
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }
  const formData = await req.formData()
  
  const title = formData.get('title') as string
  const carBrand = formData.get('carBrand') as string
  const file = formData.get('file') as File
  const manualId = formData.get('manualId') as string | null // если обновление существующего

  if (!file) {
    return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const fileHash = DiffSync.hashFile(buffer)
  const chunksHash = DiffSync.hashChunks(buffer)

  const uploadDir = path.join(process.cwd(), 'uploads', 'manuals')
  await fs.mkdir(uploadDir, { recursive: true })
  
  const fileName = `${Date.now()}-${file.name}`
  const localPath = path.join(uploadDir, fileName)
  await fs.writeFile(localPath, buffer)

  if (manualId) {
    const existingManual = await prisma.manual.findUnique({
      where: { id: parseInt(manualId) }
    })

    if (existingManual?.chunksHash) {
      const oldHashes = JSON.parse(existingManual.chunksHash)
      const changedChunks = DiffSync.diff(oldHashes, chunksHash)

      return NextResponse.json({
        success: true,
        manualId: existingManual.id,
        diff: {
          version: existingManual.version + 1,
          changedChunks,
          totalChunks: Object.keys(chunksHash).length,
          savings: `${Math.round((1 - changedChunks.length / Object.keys(chunksHash).length) * 100)}%`
        },
        fullFile: `/api/manuals/download/${existingManual.id}`
      })
    }

    const manual = await prisma.manual.update({
      where: { id: parseInt(manualId) },
      data: {
        title,
        carBrand,
        localPath,
        fileHash,
        chunksHash: JSON.stringify(chunksHash),
        version: { increment: 1 }
      }
    })

    return NextResponse.json({ success: true, manualId: manual.id, version: manual.version })
  }

  const manual = await prisma.manual.create({
    data: {
      title,
      carBrand,
      fileLink: '',
      localPath,
      fileHash,
      chunksHash: JSON.stringify(chunksHash),
      uploaderId: decoded.userId
    }
  })

  return NextResponse.json({ 
    success: true, 
    manualId: manual.id,
    totalChunks: Object.keys(chunksHash).length
  })
}