import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ModeToggle } from "@/components/mode-toggle"
import { UserDialog } from '@/components/user/UserDialog'
import { useStore } from '@/store/useStore'
import { getInitial } from '@/utils'
import { supabase } from '@/lib/supabase'

export function Header() {
  const { user } = useStore()
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isDisplayRole, setIsDisplayRole] = useState(false)
  const location = useLocation()
  const roomId = new URLSearchParams(location.search).get('id')

  useEffect(() => {
    async function checkUserRole() {
      if (!user || !roomId) {
        setIsDisplayRole(false)
        return
      }

      const { data, error } = await supabase
        .from('user_rooms')
        .select('role_id')
        .eq('user_id', user.id)
        .eq('room_id', roomId)
        .single()

      if (!error && data) {
        setIsDisplayRole(parseInt(data.role_id) === 2)
      } else {
        setIsDisplayRole(false)
      }
    }

    checkUserRole()
  }, [user, roomId])

  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link to="/" className="text-2xl font-bold"><span className="font-swiss italic">Euro</span>voting</Link>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          {user && (
            isDisplayRole ? (
              <span className="text-sm font-medium">Display</span>
            ) : (
              <button
                onClick={() => setIsUserDialogOpen(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition hover:opacity-80 border-2 border-black dark:border-white"
                style={{
                  backgroundColor: user.color,
                  color: user.text_color
                }}
              >
                {getInitial(user.name)}
              </button>
            )
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
