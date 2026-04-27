'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'

interface ManualCardProps {
  manual: {
    id: number
    title: string
    carBrand: string
    fileLink: string
    uploader: {
      name: string
    }
  }
}

export default function ManualCard({ manual }: ManualCardProps) {
  const { isAuthenticated, token } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !token) return

    fetch('/api/favorites?idsOnly=true', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(ids => {
      if (Array.isArray(ids)) {
        setIsFavorite(ids.includes(manual.id))
      }
    })
    .catch(err => console.error(err))
  }, [isAuthenticated, token, manual.id])

  const toggleFavorite = async () => {
    if (!isAuthenticated || !token || loading) return
    
    setLoading(true)

    try {
      const res = await fetch('/api/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ manualId: manual.id })
      })

      if (res.ok) {
        setIsFavorite(!isFavorite)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card relative">
      <div className="flex justify-between items-start mb-2">
        <Link href={manual.fileLink}>
          <h3 className="text-lg font-semibold hover:text-blue-600">
            {manual.title}
          </h3>
        </Link>
        
        {isAuthenticated && (
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className="text-xl hover:scale-110 transition-transform ml-2 flex-shrink-0"
            title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            {isFavorite ? '⭐' : '☆'}
          </button>
        )}
      </div>
      <p className="text-gray-600 mb-2"> Загрузил: {manual.uploader.name}. Марка: {manual.carBrand}</p>
      
      <div className="flex justify-between items-center">
        <Link
          href={manual.fileLink}
          className="text-blue-600 hover:underline text-sm"
          target="_blank"
        >
          📄 Открыть руководство
        </Link>
      </div>
    </div>
  )
}