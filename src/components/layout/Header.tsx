import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserDialog } from '@/components/user/UserDialog'
import { useStore } from '@/store/useStore'
import { useUserSubscription } from '@/hooks/useUserSubscription'
import { UserAvatar } from '@/components/ui/user-avatar'

export function Header() {
  const { user } = useStore()
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  useUserSubscription()

  return (
    <header className="relative z-100 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 flex h-16 items-center justify-between">
        <Link to="/" className="text-2xl font-bold"><span className="font-swiss italic">Eurovoting</span></Link>
        <div className="flex items-center space-x-4">
          {user && (
            <UserAvatar
              name={user.name}
              color={user.color}
              textColor={user.text_color}
              isCurrentUser={true}
              onClick={() => setIsUserDialogOpen(true)}
            />
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
