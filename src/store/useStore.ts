import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { User, Theme } from '@/types/User'
import { Room, Points } from '@/types/Room'

interface AppState {
  user: User | null
  room: Room | null
  theme: Theme
  points: Record<string, Points>
  setUser: (user: User | null) => void
  setRoom: (room: Room | null) => void
  setTheme: (theme: Theme) => void
  clearState: () => void
  savePoints: (roomId: string, points: Points) => void
  getPoints: (roomId: string) => Points | null
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      room: null,
      theme: 'light',
      points: {},
      setUser: (user) => set({ user }),
      setRoom: (room) => set({ room }),
      setTheme: (theme) => set({ theme }),
      clearState: () => set({ user: null, room: null }),
      savePoints: (roomId, points) => {
        set((state) => ({
          points: {
            ...state.points,
            [roomId]: points
          }
        }))
      },
      getPoints: (roomId) => {
        const state = get()
        return state.points[roomId] || null
      }
    }),
    {
      name: 'eurovoting-storage',
    }
  )
)
