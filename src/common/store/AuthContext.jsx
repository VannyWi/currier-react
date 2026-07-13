import { useState } from 'react'
import { login as loginRequest, register as registerRequest } from '../../features/auth/services/auth.js'
import { AuthContext } from './authContextValue.js'
const storageKey = 'rapidocourier.session'

function readSession() {
  return JSON.parse(localStorage.getItem(storageKey) || 'null')
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)

  function persist(nextSession) {
    localStorage.setItem(storageKey, JSON.stringify(nextSession))
    setSession(nextSession)
  }

  async function login(credentials) {
    const nextSession = await loginRequest(credentials)
    persist(nextSession)
    return nextSession
  }

  async function register(payload) {
    const nextSession = await registerRequest(payload)
    persist(nextSession)
    return nextSession
  }

  function logout() {
    localStorage.removeItem(storageKey)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, isAuthenticated: Boolean(session), login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
