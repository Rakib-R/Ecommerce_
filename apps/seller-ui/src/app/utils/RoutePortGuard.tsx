'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface RouteGuardProps {
  expectedPort: string
  isAuthenticated: boolean
  protectedRoutes: string[]
  children: React.ReactNode
}

export const RouteGuard = ({ 
  expectedPort, 
  isAuthenticated, 
  protectedRoutes,
  children 
}: RouteGuardProps) => {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 1. Port Guard
    if (typeof window !== 'undefined') {
      const currentPort = window.location.port || '80'
      const currentHost = window.location.hostname
      
      if (
        (currentHost === 'localhost' || currentHost === 'localhost') && 
        currentPort !== expectedPort
      ) {
        window.location.href = `http://${currentHost}:${expectedPort}${window.location.pathname}`
        return
      }
    }

    // 2. Route Guard (only if authenticated)
    if (isAuthenticated && protectedRoutes.includes(pathname)) {
      router.push('/')
    }
  }, [expectedPort, isAuthenticated, pathname, router, protectedRoutes])

  return <>{children}</>
}