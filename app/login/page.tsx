'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link' 

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [twoFactorRequired, setTwoFactorRequired] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorError, setTwoFactorError] = useState('')

  useEffect(() => {
    if (!twoFactorRequired) return

    const focusTwoFactorInput = () => {
      const input = document.getElementById('twofactor') as HTMLInputElement | null
      if (!input) return
      input.focus({ preventScroll: true })
      input.select()
    }

    const rafId = window.requestAnimationFrame(focusTwoFactorInput)
    const timeoutA = window.setTimeout(focusTwoFactorInput, 0)
    const timeoutB = window.setTimeout(focusTwoFactorInput, 150)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.clearTimeout(timeoutA)
      window.clearTimeout(timeoutB)
    }
  }, [twoFactorRequired])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTwoFactorError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ongeldige inloggegevens of account is inactief.')
      } else if (data.twoFactorRequired) {
        setTwoFactorRequired(true)
        setPassword('')
      } else {
        const nextPath = data?.twoFactorSetupRequired
          ? '/setup'
          : data?.user?.role === 'SUPERADMIN'
            ? '/superadmin'
            : '/dashboard'
        router.push(nextPath)
        router.refresh()
      }
    } catch {
      setError('Er is een onverwachte fout opgetreden.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTwoFactorError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-2fa', token: twoFactorCode })
      })
      const data = await res.json()
      if (!res.ok) {
        setTwoFactorError(data.error || 'Ongeldige 2FA-code.')
      } else {
        const nextPath = data?.user?.role === 'SUPERADMIN' ? '/superadmin' : '/dashboard'
        router.push(nextPath)
        router.refresh()
      }
    } catch {
      setTwoFactorError('Er is een onverwachte fout opgetreden tijdens 2FA.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg transition-all duration-300 hover:border-accent-primary hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] focus-within:border-accent-primary focus-within:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] active:border-accent-primary active:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-2">
            {/* Placeholder voor het statische logo in de public map */}
            <img 
              src="/football-scouting-platform-logo.png" 
              alt="Football Scouting Platform Logo" 
              className="h-16 w-auto object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
              onError={(e) => {
                // Fallback als logo.png nog niet bestaat
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Football Scouting Platform</CardTitle>
          <CardDescription>
            {twoFactorRequired ? 'Voer je 2FA-code in om verder te gaan' : 'Log in op je club dashboard'}
          </CardDescription>
        </CardHeader>
        {!twoFactorRequired ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-text-muted">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-text-muted">Wachtwoord</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-destructive font-medium">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-8 pb-6 flex flex-col gap-3 items-center">
              <Button type="submit" className="w-full btn-premium text-white" disabled={loading}>
                {loading ? 'Bezig met inloggen...' : 'Inloggen'}
              </Button>
              <Link
                href="/forgot-password"
                className="self-center text-xs text-accent-primary hover:text-accent-glow transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/40 focus-visible:ring-accent-glow rounded-sm"
              >
                Wachtwoord vergeten?
              </Link>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleSubmitTwoFactor}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
              <Label htmlFor="twofactor" className="text-xs font-semibold uppercase tracking-wide text-text-muted">2FA-code</Label>
                <Input
                  id="twofactor"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFactorCode}
                  autoFocus
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  required
                />
              </div>
              {twoFactorError && (
                <div className="text-sm text-destructive font-medium">
                  {twoFactorError}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-8 pb-6 flex flex-col gap-3 items-center">
              <Button type="submit" className="w-full btn-premium text-white" disabled={loading}>
                {loading ? 'Code controleren...' : 'Inloggen'}
              </Button>

              <Link
                href="/login"
                onClick={(e) => {
                  e.preventDefault()
                  setTwoFactorRequired(false)
                  setTwoFactorCode('')
                  setTwoFactorError('')
                  setError('')
                }}
                className="self-center cursor-pointer text-xs text-accent-primary hover:text-accent-glow transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/40 focus-visible:ring-accent-glow rounded-sm"
              >
                ← Terug naar inloggen
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
