import React from 'react'

export function Footer() {
  return (
    <footer className="py-4 md:py-6 bg-[#0A0A0A] relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 ml-auto">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Ryuusei3
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
