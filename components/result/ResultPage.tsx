"use client"

import { useEffect, useState } from 'react'
import { AppHeader } from '@/components/shared/AppHeader'
import { DisclaimerBanner } from '@/components/shared/DisclaimerBanner'
import { ReportMeta } from '@/components/result/ReportMeta'
import { ScanImagePreview } from '@/components/result/ScanImagePreview'
import { ResultSummaryCard } from '@/components/result/ResultSummaryCard'
import { PossibleSignsCard } from '@/components/result/PossibleSignsCard'
import { RedFlagsCard } from '@/components/result/RedFlagsCard'
import { SelfCareCard } from '@/components/result/SelfCareCard'
import { RecommendedActionCard } from '@/components/result/RecommendedActionCard'
import { UrgentCareAlert } from '@/components/result/UrgentCareAlert'
import { FollowUpActions } from '@/components/result/FollowUpActions'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX } from 'lucide-react'
import { useTextToSpeech } from '@/lib/hooks/speech'
import { createClient } from '@/lib/supabase/client'
import type { ScreeningWithResult } from '@/lib/data/screenings'
import type { Profile } from '@/lib/data/profile'

interface ResultPageProps {
  screening: ScreeningWithResult
}

export function ResultPage({ screening }: ResultPageProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const textToSpeech = useTextToSpeech()

  const aiResult = screening.ai_analysis_result
  const isUrgent = screening.risk_level === 'urgent' ||
                   aiResult?.seek_urgent_care ||
                   (screening.condition?.emergency_indicators?.length ?? 0) > 0

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profileData)
      }
    }
    void loadProfile()
  }, [])

  const voiceEnabled = profile?.preferences?.chat?.voiceEnabled ?? false
  const preferredLanguage = profile?.preferences?.language?.preferredLanguage ?? 'en-US'

  const generateResultText = () => {
    const parts = []

    // Summary
    if (aiResult?.summary) {
      parts.push(`Summary: ${aiResult.summary}`)
    }

    // Condition
    if (screening.condition?.name) {
      parts.push(`Condition: ${screening.condition.name}`)
    }

    // Risk level
    if (screening.risk_level) {
      parts.push(`Risk level: ${screening.risk_level}`)
    }

    // Possible signs
    if (aiResult?.possible_signs?.length) {
      parts.push(`Possible signs: ${aiResult.possible_signs.join(', ')}`)
    }

    // Red flags
    if (aiResult?.red_flags?.length) {
      parts.push(`Red flags: ${aiResult.red_flags.join(', ')}`)
    }

    // Self care
    if (aiResult?.self_care?.length) {
      parts.push(`Self care recommendations: ${aiResult.self_care.join(', ')}`)
    }

    // Recommended actions
    if (aiResult?.recommended_actions?.length) {
      parts.push(`Recommended actions: ${aiResult.recommended_actions.join(', ')}`)
    }

    return parts.join('. ')
  }

  const handleReadResultAloud = () => {
    const resultText = generateResultText()
    if (resultText) {
      textToSpeech.speak(resultText, {
        lang: preferredLanguage,
        rate: 0.9,
        pitch: 1,
      })
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* <AppHeader /> */}

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <ReportMeta screening={screening} />
            {voiceEnabled && textToSpeech.isSupported && (
              <Button
                onClick={handleReadResultAloud}
                variant="outline"
                className="flex items-center gap-2"
                disabled={textToSpeech.isSpeaking}
              >
                {textToSpeech.isSpeaking ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                {textToSpeech.isSpeaking ? 'Stop' : 'Read Aloud'}
              </Button>
            )}
          </div>

          <DisclaimerBanner />

          {isUrgent && <UrgentCareAlert />}

          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              <ResultSummaryCard screening={screening} />
              <PossibleSignsCard screening={screening} />
              <RedFlagsCard screening={screening} />
              <SelfCareCard screening={screening} />
              <RecommendedActionCard screening={screening} />
            </div>

            <div className="space-y-6">
              <ScanImagePreview screening={screening} />
              <FollowUpActions screeningId={screening.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}