import React from 'react'

import { Header } from './Header'
import { Footer } from './Footer'
import { Background } from './Background'
import { useStore } from '@/store/useStore'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user } = useStore()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 relative">
        <Background />
        <div className='relative z-1'>{children}</div>
      </main>
      <Footer />
    </div>
  )
}
