import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const getUserId = (req: NextRequest) => {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    if (!token) return null
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    return decoded.userId
  } catch {
    return null
  }
}

export const GET = async (req: NextRequest) => {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const onlyIds = new URL(req.url).searchParams.get('idsOnly') === 'true'

  const favs = await prisma.favorite.findMany({
    where: { userId },
    select: { manualId: true, manual: { select: { id: true, title: true, carBrand: true, fileLink: true, uploader: { select: { name: true } } } } }
  })

  if (onlyIds) return NextResponse.json(favs.map(f => f.manualId))
  return NextResponse.json(favs.filter(f => f.manual).map(f => f.manual))
}

export const POST = async (req: NextRequest) => {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const { manualId } = await req.json()
  await prisma.favorite.create({ data: { userId, manualId } })
  return NextResponse.json({ ok: true }, { status: 201 })
}

export const DELETE = async (req: NextRequest) => {
  const userId = getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const { manualId } = await req.json()
  await prisma.favorite.delete({ where: { userId_manualId: { userId, manualId } } })
  return NextResponse.json({ ok: true })
}