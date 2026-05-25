'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { CAR_BRANDS } from '@/lib/carBrands'

interface ExistingManual {
  id: number
  title: string
  carBrand: string
  version: number
}

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
  const [uploadMode, setUploadMode] = useState<'new' | 'update'>('new')
  const [existingManuals, setExistingManuals] = useState<ExistingManual[]>([])
  const [selectedManualId, setSelectedManualId] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchManuals = async () => {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/manuals/uploaded', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setExistingManuals(data)
      }
    }
    if (isAuthenticated) {
      fetchManuals()
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!formData.file) {
      setError('Выберите файл')
      return
    }

    if (uploadMode === 'update' && !selectedManualId) {
      setError('Выберите руководство для обновления')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const formDataObj = new FormData()
      formDataObj.append('title', formData.title || '')
      formDataObj.append('carBrand', formData.carBrand || '')
      formDataObj.append('file', formData.file)

      if (uploadMode === 'update') {
        formDataObj.append('manualId', selectedManualId)
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка загрузки')
      }

      if (data.diff) {
        setSuccessMessage(
          `Файл обновлён! Версия ${data.diff.version}. `
        )
        setFormData({ title: '', carBrand: '', file: null })
        setSelectedManualId('')
      } else {
        router.push('/profile')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleManualSelect = (manualId: string) => {
    setSelectedManualId(manualId)
    const manual = existingManuals.find(m => m.id === parseInt(manualId))
    if (manual) {
      setFormData({
        ...formData,
        title: manual.title,
        carBrand: manual.carBrand
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Загрузить руководство</h1>

        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => {
              setUploadMode('new')
              setSelectedManualId('')
              setFormData({ title: '', carBrand: '', file: null })
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              uploadMode === 'new'
                ? 'btn-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📄 Новое руководство
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('update')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              uploadMode === 'update'
                ? 'btn-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔄 Обновить существующее
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {uploadMode === 'update' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Выберите руководство для обновления
              </label>
              <select
                required
                className="input-field"
                value={selectedManualId}
                onChange={(e) => handleManualSelect(e.target.value)}
              >
                <option value="">Выберите из списка...</option>
                {existingManuals.map((manual) => (
                  <option key={manual.id} value={manual.id}>
                    {manual.title} (v{manual.version})
                  </option>
                ))}
              </select>
              {existingManuals.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  У вас пока нет загруженных руководств. Сначала загрузите новое.
                </p>
              )}
            </div>
          )}

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
              placeholder="Например: Citroen Berlingo 2011"
              disabled={uploadMode === 'update' && !!selectedManualId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Марка автомобиля
            </label>
            <select
              required
              className="input-field"
              value={formData.carBrand}
              onChange={(e) => setFormData({...formData, carBrand: e.target.value})}
              disabled={uploadMode === 'update' && !!selectedManualId}
            >
              <option value="">Выберите марку</option>
              {CAR_BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {uploadMode === 'update' ? 'Новая версия файла (PDF)' : 'Файл руководства (PDF)'}
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

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (uploadMode === 'update' && existingManuals.length === 0)}
            className="btn-primary w-full"
          >
            {loading
              ? 'Загрузка...'
              : uploadMode === 'update'
                ? 'Обновить руководство'
                : 'Загрузить руководство'}
          </button>
        </form>
      </div>
    </div>
  )
}