import React from 'react'
import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <h1 className="text-2xl font-bold"><span className="font-swiss italic">Euro</span>voting</h1>
        <div className="flex items-center space-x-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
