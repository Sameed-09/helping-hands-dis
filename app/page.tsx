'use client'

import { AuthScreen } from '@/components/auth-screen'
import { Dashboard } from '@/components/dashboard'
import { useRelief } from '@/lib/store'

export default function Page() {
  const { user } = useRelief()
  return user ? <Dashboard /> : <AuthScreen />
}
