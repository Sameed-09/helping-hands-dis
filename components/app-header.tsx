'use client'

import Image from 'next/image'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRelief } from '@/lib/store'

const ROLE_LABEL = {
  volunteer: 'Volunteer',
  coordinator: 'Coordinator',
  admin: 'Admin',
} as const

export function AppHeader() {
  const { user, signOut } = useRelief()
  if (!user) return null
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-2.5">
        <Image
          src="/logo-icon.png"
          alt=""
          width={44}
          height={44}
          className="size-10 rounded-full sm:size-11"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold leading-tight text-brand">
            Helping Hands
          </p>
          <p className="truncate text-xs text-muted-foreground">
            No Need Too Big, No Help Too Far
          </p>
        </div>
        <div className="hidden text-right text-sm sm:block">
          <p className="font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">
            {ROLE_LABEL[user.role]} (sample role)
          </p>
        </div>
        <Button variant="outline" size="lg" onClick={signOut}>
          <LogOut aria-hidden />
          <span className="sr-only sm:not-sr-only">Sign out</span>
        </Button>
      </div>
    </header>
  )
}
