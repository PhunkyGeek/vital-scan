import { notFound } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { getScreeningWithResult } from '@/lib/data/screenings'
import { ResultPage } from '@/components/result/ResultPage'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ScanResultPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) {
    notFound()
  }

  console.log('Scan result page debug:', {
    routeId: id,
    currentUserId: authData.user.id,
  })

  const screening = await getScreeningWithResult(supabase, id, authData.user.id)
  
  console.log('Screening fetch result:', {
    screeningFound: !!screening,
    screeningUserId: screening?.user_id,
    screeningResultsCount: screening?.result ? 1 : 0,
  })

  if (!screening) {
    notFound()
  }

  return <ResultPage screening={screening} />
}