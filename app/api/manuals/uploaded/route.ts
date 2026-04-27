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
  if (!userId) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  try {
    const manuals = await prisma.manual.findMany({
      where: {
        uploaderId: userId
      },
      include: {
        uploader: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    })

    return NextResponse.json(manuals)
  } catch (error) {
    console.error('Error fetching uploaded manuals:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении загруженных руководств' },
      { status: 500 }
    )
  }
}