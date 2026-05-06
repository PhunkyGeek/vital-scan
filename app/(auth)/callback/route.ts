import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') ?? undefined

  const hasCode = Boolean(code)
  const hasTokenHash = Boolean(tokenHash)
  console.log('Auth callback:', { hasCode, hasTokenHash, type })

  if (!hasCode && !hasTokenHash) {
    console.error('Auth callback failed: missing code or token_hash/type')
    return redirect('/login?error=confirmation_failed')
  }

  try {
    const supabase = await createClient()
    let response

    if (hasCode) {
      response = await supabase.auth.exchangeCodeForSession(code as string)
    } else {
      response = await supabase.auth.verifyOtp({
        token_hash: tokenHash as string,
        type: type as 'signup' | 'magiclink' | 'sms' | 'email',
      })
    }

    const { data, error } = response

    if (error || !data?.session) {
      const errorMessage = error?.message ?? 'Unknown authentication error'
      console.error('Auth callback failed:', errorMessage)
      return redirect('/login?error=confirmation_failed')
    }

    return redirect('/auth/confirmed')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown exception'
    console.error('Auth callback exception:', message)
    return redirect('/login?error=confirmation_failed')
  }
}
