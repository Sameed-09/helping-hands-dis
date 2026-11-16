'use client'

import Image from 'next/image'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { ErrorText, Field, inputClass, Notice } from '@/components/ui-bits'
import { useRelief } from '@/lib/store'
import type { Role } from '@/lib/types'
import { cn } from '@/lib/utils'

type Mode = 'signin' | 'signup' | 'reset'

const TABS: { id: Mode; label: string }[] = [
  { id: 'signin', label: 'Sign in' },
  { id: 'signup', label: 'Create account' },
  { id: 'reset', label: 'Reset password' },
]

const ROLES: { id: Role; label: string }[] = [
  { id: 'volunteer', label: 'Volunteer / contributor' },
  { id: 'coordinator', label: 'Coordinator' },
  { id: 'admin', label: 'Admin' },
]

export function AuthScreen() {
  const { signIn } = useRelief()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('volunteer')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setMessage(null)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!identifier.trim()) {
      setError('Enter an email address or mobile number.')
      return
    }
    if (mode === 'reset') {
      setMessage(
        'Sample mode: no message is sent. With live sign-in configured, a reset link would be sent to this email or mobile number.',
      )
      return
    }
    if (!password) {
      setError('Enter a password.')
      return
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Enter your name.')
      return
    }
    signIn({ identifier, name: mode === 'signup' ? name : undefined, role })
  }

  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <section
        aria-label="About Helping Hands"
        className="flex flex-col items-center justify-center gap-6 bg-brand px-6 py-8 text-primary-foreground lg:py-12"
      >
        <div className="hidden rounded-3xl bg-[#fcfcfa] p-6 shadow-lg lg:block">
          <Image
            src="/logo-full.jpg"
            alt="Helping Hands logo: two hands exchanging a box marked with a heart. Tagline: No Need Too Big, No Help Too Far."
            width={502}
            height={685}
            priority
            className="h-auto w-64 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-3 lg:hidden">
          <Image
            src="/logo-icon.png"
            alt=""
            width={56}
            height={56}
            priority
            className="size-14 rounded-full"
          />
          <div>
            <p className="text-2xl font-bold leading-tight">Helping Hands</p>
            <p className="text-sm opacity-90">
              No Need Too Big, No Help Too Far
            </p>
          </div>
        </div>
        <p className="hidden max-w-sm text-balance text-center text-base leading-relaxed opacity-95 lg:block">
          See which communities in India are affected by disasters, what
          supplies they need, and coordinate pledges and deliveries.
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="text-balance text-2xl font-bold">
            {mode === 'signin' && 'Sign in to Helping Hands'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'reset' && 'Reset your password'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Disaster-relief coordination for India.
          </p>

          <div className="mt-4">
            <Notice tone="warn">
              <strong>Sample login.</strong> Any email or mobile number and any
              password will work. No account is stored and all data shown is
              sample data.
            </Notice>
          </div>

          <div
            role="tablist"
            aria-label="Account actions"
            className="mt-5 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={mode === t.id}
                onClick={() => switchMode(t.id)}
                className={cn(
                  'min-h-10 rounded-lg px-2 text-sm font-medium transition-colors',
                  mode === t.id
                    ? 'bg-card text-brand shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4" noValidate>
            {mode === 'signup' && (
              <Field label="Full name" htmlFor="auth-name">
                <input
                  id="auth-name"
                  className={inputClass}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
            )}
            <Field label="Email or mobile number" htmlFor="auth-id">
              <input
                id="auth-id"
                className={inputClass}
                autoComplete="username"
                inputMode="email"
                placeholder="you@example.com or 98XXXXXXXX"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </Field>
            {mode !== 'reset' && (
              <Field label="Password" htmlFor="auth-password">
                <input
                  id="auth-password"
                  type="password"
                  className={inputClass}
                  autoComplete={
                    mode === 'signup' ? 'new-password' : 'current-password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
            )}
            {mode !== 'reset' && (
              <Field
                label="Sample role"
                htmlFor="auth-role"
                hint="Demo only. With live sign-in, your role is assigned by an admin and enforced by database permissions."
              >
                <select
                  id="auth-role"
                  className={inputClass}
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <ErrorText message={error} />
            {message ? (
              <p role="status" className="text-sm text-monitor">
                {message}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="h-11 text-base">
              {mode === 'signin' && 'Sign in'}
              {mode === 'signup' && 'Create account'}
              {mode === 'reset' && 'Send reset link'}
            </Button>
          </form>
        </div>
      </section>
    </main>
  )
}
