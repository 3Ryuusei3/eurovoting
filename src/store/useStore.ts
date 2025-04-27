import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { User, Theme } from '@/types/User'
import { Room, Points } from '@/types/Room'

interface AppState {
  user: User | null
  rooms: Room[]
  theme: Theme
  points: Record<string, Points>
  // Nuevo estado para rastrear si el modal de información se ha mostrado para cada sala
  infoModalShown: Record<string, boolean>
  setUser: (user: User | null) => void
  setRooms: (rooms: Room[]) => void
  addRoom: (room: Room) => void
  removeRoom: (roomId: string) => void
  setTheme: (theme: Theme) => void
  clearState: () => void
  savePoints: (roomId: string, points: Points) => void
  getPoints: (roomId: string) => Points | null
  // Nuevas funciones para gestionar el estado del modal de información
  setInfoModalShown: (roomId: string, shown: boolean) => void
  getInfoModalShown: (roomId: string) => boolean
  removeUser: () => void
  removeRooms: () => void
  removePoints: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      rooms: [],
      theme: 'dark',
      points: {},
      infoModalShown: {},
      setUser: (user) => set({ user }),
      setRooms: (rooms) => set({ rooms }),
      addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
      removeRoom: (roomId) => set((state) => ({
        rooms: state.rooms.filter(r => r.id !== roomId)
      })),
      setTheme: (theme) => set({ theme }),
      clearState: () => set({ user: null, rooms: [] }),
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
      },
      setInfoModalShown: (roomId, shown) => {
        set((state) => ({
          infoModalShown: {
            ...state.infoModalShown,
            [roomId]: shown
          }
        }))
      },
      getInfoModalShown: (roomId) => {
        const state = get()
        return state.infoModalShown[roomId] || false
      },
      removeUser: () => set({ user: null }),
      removeRooms: () => set({ rooms: [] }),
      removePoints: () => set({ points: {} })
    }),
    {
      name: 'eurovoting-storage',
    }
  )
)
