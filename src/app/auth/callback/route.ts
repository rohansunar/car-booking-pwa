import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'

export async function GET(request: Request) {
  const callbackUrl = new URL(request.url)
  const code = callbackUrl.searchParams.get('code')
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL('/operator', callbackUrl.origin))
  }

  const loginUrl = new URL('/login', callbackUrl.origin)
  loginUrl.searchParams.set('error', 'google_auth')
  return NextResponse.redirect(loginUrl)
}
