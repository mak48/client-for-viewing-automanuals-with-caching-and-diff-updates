'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import { persistentLoader } from '@/lib/manualLoader'
import {Wrench, Star} from 'lucide-react';

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
  const [isOpening, setIsOpening] = useState(false)
  const [isCached, setIsCached] = useState(false)

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
const handleOpenManual = async (e: React.MouseEvent) => {
  e.preventDefault()
  setIsOpening(true)

  try {
    const buffer = await persistentLoader.loadManual(manual.id)
    
    setIsCached(true)

    const blob = new Blob([buffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')

    setTimeout(() => URL.revokeObjectURL(url), 60000)
  } catch (error) {
    console.error('Ошибка загрузки:', error)
  } finally {
    setIsOpening(false)
  }
}
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
    <div className="group block">
      <div
        className="bg-white rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border border-border"
        style={{ borderLeft: '4px solid #D85A30' }}
      >
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#FAECE7' }}
            >
              <Wrench className="w-5 h-5 text-[#D85A30]"/>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  onClick={toggleFavorite}
                  disabled={loading}
                  className="text-xl hover:scale-110 transition-transform flex-shrink-0"
                  title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                >
                  {isFavorite ? (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <Star className="w-5 h-5 text-gray-400" />
                    )}
                </button>
              )}
            </div>
          </div>

          <Link href={manual.fileLink}>
            <h3 className="font-semibold text-[15px] text-gray-900 leading-snug mb-2 hover:text-[#D85A30] transition-colors">
              {manual.title}
            </h3>
          </Link>

          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <span className="font-medium text-gray-700">{manual.carBrand}</span>
            <span className="text-gray-300">·</span>
            <span>{manual.uploader.name}</span>
          </div>
        </div>

        <div
          className="px-5 py-3 flex items-center justify-between border-t border-gray-100"
          style={{ background: '#F9FAFB' }}
        >
          <button
            onClick={handleOpenManual}
            disabled={isOpening}
            className="text-xs text-gray-400 hover:text-[#D85A30] transition-colors disabled:opacity-50"
          >
            {isOpening 
              ? '⏳ Загрузка...' 
              : isCached 
                ? '📦 Открыть (из кэша)' 
                : '📄 Открыть руководство'
            }
          </button>
        </div>
      </div>
    </div>
  )
}