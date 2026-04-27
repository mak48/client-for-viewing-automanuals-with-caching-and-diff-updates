'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Manual {
  id: number
  title: string
  carBrand: string
  fileLink: string
  uploader: {
    name: string
  }
}

export default function ProfilePage() {
  const { user, isAuthenticated, token } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Manual[]>([])
  const [uploaded, setUploaded] = useState<Manual[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/login')
      return
    }

    fetchProfileData()
  }, [isAuthenticated, token])

  const fetchProfileData = async () => {
    try {
      const [favRes, uploadRes] = await Promise.all([
        fetch('/api/favorites', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/manuals/uploaded', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (favRes.ok) {
        const favData = await favRes.json()
        setFavorites(Array.isArray(favData) ? favData : [])
      } else {
        setFavorites([])
      }

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json()
        setUploaded(Array.isArray(uploadData) ? uploadData : [])
      } else {
        setUploaded([])
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
      setFavorites([])
      setUploaded([])
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) return null

  return (
    <div>
      <div className="card mb-8">
        <h1 className="text-3xl font-bold mb-2">👤 Мой профиль</h1>
        <p className="text-xl text-gray-600">Имя пользователя: {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center mb-4">
             <span className="text-2xl mr-2">☆</span>
            <h2 className="text-2xl font-bold">Избранное</h2>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : favorites.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">
              Нет избранных мануалов
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((manual) => (
                <Link
                  key={manual.id}
                  href={manual.fileLink}
                  className="card block hover:bg-gray-50"
                >
                  <h3 className="font-semibold">{manual.title}</h3>
                  <p className="text-sm text-gray-600">{manual.carBrand}</p>
                  <p className="text-xs text-gray-500 mt-2">Файл с руководством</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">▽</span>
            <h2 className="text-2xl font-bold">Загруженное</h2>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : uploaded.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">
              Нет загруженных мануалов
            </div>
          ) : (
            <div className="space-y-3">
              {uploaded.map((manual) => (
                <Link
                  key={manual.id}
                  href={manual.fileLink}
                  className="card block hover:bg-gray-50"
                >
                  <h3 className="font-semibold">{manual.title}</h3>
                  <p className="text-sm text-gray-600">{manual.carBrand}</p>
                  <p className="text-xs text-gray-500 mt-2">Файл с руководством</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}