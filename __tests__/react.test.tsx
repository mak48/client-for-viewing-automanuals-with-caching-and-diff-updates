import { render, screen, fireEvent } from '@testing-library/react'
import ManualCard from '../components/ManualCard'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    token: null
  })
}))

describe('ManualCard', () => {
  const mockManual = {
    id: 1,
    title: 'Руководство по ремонту Lada Granta',
    carBrand: 'Lada Granta',
    fileLink: 'https://example.com/manual.pdf',
    uploader: { name: 'Иван Петров' }
  }

  it('должен отображать название руководства', () => {
    render(<ManualCard manual={mockManual} />)
    expect(screen.getByText(mockManual.title)).toBeInTheDocument()
  })

  it('должен отображать марку автомобиля', () => {
    render(<ManualCard manual={mockManual} />)
    expect(screen.getByText(mockManual.carBrand)).toBeInTheDocument()
  })

  it('должен отображать имя загрузившего', () => {
    render(<ManualCard manual={mockManual} />)
    expect(screen.getByText(mockManual.uploader.name)).toBeInTheDocument()
  })

  it('должен иметь кнопку открытия руководства', () => {
    render(<ManualCard manual={mockManual} />)
    const button = screen.getByText(/Открыть руководство/i)
    expect(button).toBeInTheDocument()
  })
})