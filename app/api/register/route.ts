import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { name, login, password } = await req.json()

    const existingUser = await prisma.user.findUnique({
      where: { login }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким логином уже существует' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        login,
        password: hashedPassword
      }
    })

    return NextResponse.json({
      message: 'Пользователь успешно создан',
      user: { id: user.id, name: user.name, login: user.login }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    )
  }
}