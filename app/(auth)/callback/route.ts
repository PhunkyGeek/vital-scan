import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return redirect('/login?error=confirmation_failed')
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !data?.session) {
      console.error('Email confirmation exchange failed:', error)
      return redirect('/login?error=confirmation_failed')
    }

    return redirect('/auth/confirmed')
  } catch (error) {
    console.error('Email confirmation callback failed:', error)
    return redirect('/login?error=confirmation_failed')
  }
}
