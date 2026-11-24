'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/src/lib/supabase/client'

export default function LoginPage() {
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('error')) {
      setError('Google sign-in did not complete. Please try again.')
    }
  }, [])

  const signIn = async () => {
    setError(null)
    setIsSigningIn(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: new URL('/auth/callback', window.location.origin).toString() },
    })

    if (authError) {
      setError('Google sign-in could not be started. Please try again.')
      setIsSigningIn(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">RideBook</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Operator sign in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with Google to open the operator dashboard.
          </p>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={signIn}
          disabled={isSigningIn}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
        >
          <GoogleMark />
          {isSigningIn ? 'Redirecting to Google…' : 'Continue with Google'}
        </button>
      </section>
    </main>
  )
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.66 5.95c4.47-4.13 7.12-10.2 7.12-17.6Z" />
      <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.66-5.95c-2.13 1.43-4.86 2.28-8.24 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
    </svg>
  )
}
