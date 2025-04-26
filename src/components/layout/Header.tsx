import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserDialog } from '@/components/user/UserDialog'
import { useStore } from '@/store/useStore'
import { getInitial } from '@/utils'
import { useUserSubscription } from '@/hooks/useUserSubscription'

export function Header() {
  const { user } = useStore()
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  useUserSubscription()

  return (
    <header className="relative z-100 bg-[#1F1F1F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link to="/" className="text-2xl font-bold"><span className="font-swiss italic">Eurovoting</span></Link>
        <div className="flex items-center space-x-4">
          {user && (
            <button
              onClick={() => setIsUserDialogOpen(true)}
              className={`w-8 h-8 flex items-center justify-center text-sm font-medium transition hover:opacity-80`}
              style={{
                backgroundColor: user.color,
                color: user.text_color
              }}
            >
              {getInitial(user.name)}
            </button>
          )}
        </div>
      </div>
      <UserDialog
        isOpen={isUserDialogOpen}
        onClose={() => setIsUserDialogOpen(false)}
      />
    </header>
  )
}
