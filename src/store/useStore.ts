import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type User = {
  id: string
  name: string
  role_id: number
  room_id: string
  color: string
  text_color: string
  created_at: string
}

type Room = {
  id: string
  code: string
  poll_id: string
}

type Theme = 'light' | 'dark'

interface AppState {
  user: User | null
  room: Room | null
  theme: Theme
  setUser: (user: User | null) => void
  setRoom: (room: Room | null) => void
  setTheme: (theme: Theme) => void
  clearState: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      room: null,
      theme: 'light',
      setUser: (user) => set({ user }),
      setRoom: (room) => set({ room }),
      setTheme: (theme) => set({ theme }),
      clearState: () => set({ user: null, room: null }),
    }),
    {
      name: 'eurovoting-storage',
    }
  )
)
