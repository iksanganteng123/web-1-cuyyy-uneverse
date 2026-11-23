import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'admin' | 'teacher' | 'student'

export interface User {
  id: string
  username: string
  password?: string
  name: string
  role: Role
  kelas?: string
}

interface AuthState {
  users: User[]
  currentUser: User | null
  login: (username: string, password?: string) => boolean
  logout: () => void
  addUser: (newUser: Omit<User, 'id'>) => boolean
  updateUser: (id: string, updates: Omit<User, 'id'>) => boolean
  setUserPassword: (id: string, password: string) => boolean
  deleteUser: (id: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,

      login: (username, password) => {
        const inputUser = username.trim().toLowerCase()
        const inputPass = password?.trim() ?? ''

        const found = get().users.find((u) => {
          const dbUser = u.username.trim().toLowerCase()
          const dbPass = u.password?.trim() ?? ''
          return dbUser === inputUser && dbPass === inputPass
        })

        if (found) {
          const currentUser: User = {
            id: found.id,
            username: found.username,
            name: found.name,
            role: found.role,
            kelas: found.kelas,
          }
          set({ currentUser })
          return true
        }

        return false
      },

      logout: () => set({ currentUser: null }),

      addUser: (newUser) => {
        if (
          !newUser.name.trim() ||
          !newUser.username.trim() ||
          !newUser.password?.trim() ||
          (newUser.role !== 'admin' && !newUser.kelas?.trim())
        ) return false
        const duplicate = get().users.some(
          (user) => user.username.trim().toLowerCase() === newUser.username.trim().toLowerCase(),
        )
        if (duplicate) return false
        const userWithId: User = {
          ...newUser,
          username: newUser.username.trim(),
          name: newUser.name.trim(),
          password: newUser.password?.trim(),
          id: `user-${Date.now()}`,
        }
        set((state) => ({ users: [...state.users, userWithId] }))
        return true
      },

      updateUser: (id, updates) => {
        if (
          !updates.name.trim() ||
          !updates.username.trim() ||
          (updates.role !== 'admin' && !updates.kelas?.trim())
        ) return false
        const duplicate = get().users.some(
          (user) =>
            user.id !== id &&
            user.username.trim().toLowerCase() === updates.username.trim().toLowerCase(),
        )
        if (duplicate) return false
        set((state) => {
          const users = state.users.map((user) =>
            user.id === id
              ? {
                  ...user,
                  ...updates,
                  username: updates.username.trim(),
                  name: updates.name.trim(),
                  password: updates.password?.trim() || user.password,
                }
              : user,
          )
          const updatedCurrentUser =
            state.currentUser?.id === id
              ? {
                  id,
                  username: updates.username.trim(),
                  name: updates.name.trim(),
                  role: updates.role,
                  kelas: updates.kelas,
                }
              : state.currentUser
          return { users, currentUser: updatedCurrentUser }
        })
        return true
      },

      setUserPassword: (id, password) => {
        const normalizedPassword = password.trim()
        if (!normalizedPassword || !get().users.some((user) => user.id === id)) {
          return false
        }
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, password: normalizedPassword } : user,
          ),
        }))
        return true
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
          currentUser: state.currentUser?.id === id ? null : state.currentUser,
        }))
      },
    }),
    {
      name: 'elearning-auth-storage-final',
      version: 2,
      migrate: (persistedState, version) => {
        if (version >= 2 || !persistedState || typeof persistedState !== 'object') {
          return persistedState as Partial<AuthState>
        }

        const persisted = persistedState as Partial<AuthState>
        return {
          ...persisted,
          users: persisted.users?.map((user) =>
            user.username.toLowerCase() === 'admin' && user.password === '123'
              ? { ...user, password: '040304' }
              : user,
          ),
        }
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AuthState>
        const users = persisted.users ?? []
        const activeUser = persisted.currentUser
        const currentUser = activeUser
          ? {
              id: activeUser.id,
              username: activeUser.username,
              name: activeUser.name,
              role: activeUser.role,
              kelas: activeUser.kelas,
            }
          : null
        return { ...currentState, users, currentUser }
      },
    }
  )
)