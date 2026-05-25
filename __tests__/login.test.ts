import { describe, it, expect } from 'vitest'
describe('POST /api/login', () => {
  it('должен вернуть токен при правильных учётных данных', async () => {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: 'testuser',
        password: 'password123'
      })
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.token).toBeDefined()
    expect(data.user.name).toBe('Тестовый Пользователь')
  })

  it('должен вернуть ошибку при неверном пароле', async () => {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: 'testuser',
        password: 'wrongpassword'
      })
    })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toContain('Неверный')
  })
})