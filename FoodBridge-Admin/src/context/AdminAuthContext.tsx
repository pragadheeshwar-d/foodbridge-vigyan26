import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'super_admin'
}

interface AuthCtx {
  admin: AdminUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (snap.exists()) {
          const data = snap.data()
          if (data.role === 'admin' || data.role === 'super_admin') {
            setAdmin({ id: firebaseUser.uid, name: data.name, email: firebaseUser.email || '', role: data.role })
          } else {
            // Not an admin — force sign out
            await signOut(auth)
            setAdmin(null)
          }
        }
      } else {
        setAdmin(null)
      }
      setIsLoading(false)
    })
  }, [])

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    if (!snap.exists() || !['admin', 'super_admin'].includes(snap.data().role)) {
      await signOut(auth)
      throw new Error('Access denied. This portal is for admins only.')
    }
  }

  const logout = async () => {
    await signOut(auth)
    setAdmin(null)
  }

  return <Ctx.Provider value={{ admin, isLoading, login, logout }}>{children}</Ctx.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAdminAuth must be inside AdminAuthProvider')
  return ctx
}
