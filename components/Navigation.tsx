'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { BookOpen, Upload, User, LogIn, UserPlus} from 'lucide-react';

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="px-5 py-5 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#D85A30' }}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-black tracking-tight">
              Auto<span style={{ color: '#D85A30' }}>Manuals</span>
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/upload"
                  className="btn-primary flex items-center justify-center gap-1.5 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Загрузить
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-700 flex items-center gap-1.5 hover:text-gray-900 text-sm"
                >
                  <User className="w-4 h-4" />
                  Профиль
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 flex items-center gap-1.5 hover:text-gray-900 text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="btn-primary flex items-center justify-center gap-1.5 text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}