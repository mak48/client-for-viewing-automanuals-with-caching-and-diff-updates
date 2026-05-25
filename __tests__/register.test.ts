import { describe, it, expect } from 'vitest'

describe('POST /api/register', () => {
  it('должен создать нового пользователя с валидными данными', async () => {
  const response = await fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Тестовый Пользователь',
      login: 'testuser',
      password: 'password123'
    })
  })

  const data = await response.json()
  
  if (response.status === 400 && data.error?.includes('уже существует')) {
    expect(data.error).toContain('уже существует')
    return
  }
  
  expect(response.status).toBe(200)
  expect(data.user).toBeDefined()
  expect(data.user.login).toBe('testuser')
})

  it('должен вернуть ошибку при повторной регистрации с тем же логином', async () => {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Другой Пользователь',
        login: 'testuser',
        password: 'password456'
      })
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain('уже существует')
  })
})