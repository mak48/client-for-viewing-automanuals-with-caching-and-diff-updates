'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Star, Upload, LogOut } from 'lucide-react'
import ManualCard from '@/components/ManualCard'

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
  const { user, isAuthenticated, token, logout } = useAuth()
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
  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!isAuthenticated) return null

 return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="card mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-full text-orange-600">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Мой профиль</h1>
            <p className="text-lg text-gray-600 mt-1">Имя пользователя: <span className="font-semibold text-gray-800">{user?.name}</span></p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 hover:border-red-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Выйти</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4 text-gray-800">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <h2 className="text-2xl font-bold">Избранное</h2>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Загрузка...</div>
          ) : favorites.length === 0 ? (
            <div className="card text-center py-8 text-gray-500 bg-white p-6 rounded-xl border border-gray-100">
              Нет избранных мануалов
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {favorites.map((manual) => (
                <ManualCard key={manual.id} manual={manual} />
              ))}
            </div>
          )}
        </div>

        {/* Блок Загруженного */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-gray-800">
            <Upload className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold">Загруженное</h2>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Загрузка...</div>
          ) : uploaded.length === 0 ? (
            <div className="card text-center py-8 text-gray-500 bg-white p-6 rounded-xl border border-gray-100">
              Нет загруженных мануалов
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {uploaded.map((manual) => (
                <ManualCard key={manual.id} manual={manual} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}