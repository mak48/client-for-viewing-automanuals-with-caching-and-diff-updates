'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function UploadPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    carBrand: '',
    file: null as File | null
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.file) {
      setError(' ')
      return
    }

    setLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append('title', formData.title)
      formDataObj.append('carBrand', formData.carBrand)
      formDataObj.append('file', formData.file)

      const res = await fetch('/api/manuals/upload', {
        method: 'POST',
        body: formDataObj
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка загрузки')
      }

      router.push('/profile')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Загрузить руководство</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Название руководства
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Например: Руководство по ремонту Citroen Berlingo 2011"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Марка автомобиля
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.carBrand}
              onChange={(e) => setFormData({...formData, carBrand: e.target.value})}
              placeholder="Например: Citroen"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Файл руководства (PDF)
            </label>
            <input
              type="file"
              accept=".pdf"
              required
              className="input-field"
              onChange={(e) => setFormData({...formData, file: e.target.files?.[0] || null})}
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Загрузка...' : 'Загрузить руководство'}
          </button>
        </form>
      </div>
    </div>
  )
}