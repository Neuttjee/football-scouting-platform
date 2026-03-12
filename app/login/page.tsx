'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [twoFactorRequired, setTwoFactorRequired] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorError, setTwoFactorError] = useState('')

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
        const nextPath = data?.user?.role === 'SUPERADMIN' ? '/superadmin' : '/dashboard'
        router.push(nextPath)
        router.refresh()
      }
    } catch (err) {
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
    } catch (err) {
      setTwoFactorError('Er is een onverwachte fout opgetreden tijdens 2FA.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-2">
            {/* Placeholder voor het statische logo in de public map */}
            <img 
              src="/logo.png" 
              alt="Scouting Platform Logo" 
              className="h-16 w-auto object-contain"
              onError={(e) => {
                // Fallback als logo.png nog niet bestaat
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welkom</CardTitle>
          <CardDescription>
            Log in op je club dashboard
          </CardDescription>
        </CardHeader>
        {!twoFactorRequired ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
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
            <CardFooter className="pt-8 pb-6 flex flex-col gap-3">
              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                {loading ? 'Bezig met inloggen...' : 'Inloggen'}
              </Button>
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-xs text-muted-foreground hover:text-text-primary underline-offset-4 hover:underline self-center"
              >
                Wachtwoord vergeten?
              </button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleSubmitTwoFactor}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twofactor">2FA-code</Label>
                <Input
                  id="twofactor"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Voer de 6-cijferige code in uit je authenticator-app.
                </p>
              </div>
              {twoFactorError && (
                <div className="text-sm text-destructive font-medium">
                  {twoFactorError}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-8 pb-6 flex flex-col gap-3">
              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                {loading ? 'Code controleren...' : 'Inloggen met 2FA'}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
