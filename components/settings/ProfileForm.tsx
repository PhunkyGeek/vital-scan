'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import type { UserProfile } from '@/lib/data/profile'

interface ProfileFormProps {
  profile: UserProfile | null
  isLoading: boolean
  onSubmit: (data: {
    full_name: string | null
    avatar_url: string | null
    date_of_birth: string | null
    gender: string | null
    medical_history: string[] | null
    allergies: string[] | null
    emergency_contact: string | null
    emergency_phone: string | null
  }) => Promise<void>
}

export function ProfileForm({
  profile,
  isLoading,
  onSubmit,
}: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth || '')
  const [gender, setGender] = useState(profile?.gender || '')
  const [medicalHistory, setMedicalHistory] = useState(
    (profile?.medical_history || [])?.join(', ') || ''
  )
  const [allergies, setAllergies] = useState(
    (profile?.allergies || [])?.join(', ') || ''
  )
  const [emergencyContact, setEmergencyContact] = useState(
    profile?.emergency_contact || ''
  )
  const [emergencyPhone, setEmergencyPhone] = useState(
    profile?.emergency_phone || ''
  )
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  )
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setFullName(profile?.full_name || '')
    setAvatarUrl(profile?.avatar_url || '')
    setDateOfBirth(profile?.date_of_birth || '')
    setGender(profile?.gender || '')
    setMedicalHistory((profile?.medical_history || []).join(', '))
    setAllergies((profile?.allergies || []).join(', '))
    setEmergencyContact(profile?.emergency_contact || '')
    setEmergencyPhone(profile?.emergency_phone || '')
    setStatus('idle')
  }, [profile?.id, profile?.updated_at])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    const medicalHistoryArray = medicalHistory
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    const allergiesArray = allergies
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    try {
      await onSubmit({
        full_name: fullName || null,
        avatar_url: avatarUrl || null,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        medical_history: medicalHistoryArray.length > 0 ? medicalHistoryArray : null,
        allergies: allergiesArray.length > 0 ? allergiesArray : null,
        emergency_contact: emergencyContact || null,
        emergency_phone: emergencyPhone || null,
      })
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to save profile'
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Email
        </label>
        <input
          type="email"
          value={profile?.email || ''}
          disabled
          className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-muted-foreground cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Email cannot be changed
        </p>
      </div>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      <div>
        <label htmlFor="avatarUrl" className="block text-sm font-medium text-foreground mb-2">
          Avatar URL
        </label>
        <input
          id="avatarUrl"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.jpg"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-foreground mb-2">
            Date of Birth
          </label>
          <input
            id="dateOfBirth"
            type="date"
            value={dateOfBirth || ''}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-foreground mb-2">
            Gender
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="">Select gender...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="medicalHistory" className="block text-sm font-medium text-foreground mb-2">
          Medical History
        </label>
        <textarea
          id="medicalHistory"
          value={medicalHistory}
          onChange={(e) => setMedicalHistory(e.target.value)}
          placeholder="Enter past diagnoses, conditions, or treatments separated by commas"
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      <div>
        <label htmlFor="allergies" className="block text-sm font-medium text-foreground mb-2">
          Allergies
        </label>
        <textarea
          id="allergies"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          placeholder="Enter allergies separated by commas"
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="emergencyContact" className="block text-sm font-medium text-foreground mb-2">
            Emergency Contact
          </label>
          <input
            id="emergencyContact"
            type="text"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            placeholder="Name of emergency contact"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div>
          <label htmlFor="emergencyPhone" className="block text-sm font-medium text-foreground mb-2">
            Emergency Phone
          </label>
          <input
            id="emergencyPhone"
            type="tel"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
            placeholder="+1234567890"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {status === 'error' && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-2 items-start">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || status === 'loading'}
        className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Saved!
          </>
        ) : (
          'Save Changes'
        )}
      </button>
    </form>
  )
}
