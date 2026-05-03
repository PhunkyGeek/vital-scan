import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechRecognitionAPI = typeof window.SpeechRecognition

interface UseSpeechRecognitionReturn {
  isSupported: boolean
  isListening: boolean
  transcript: string
  error: string | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

/**
 * Hook for browser-based speech recognition (speech-to-text)
 * Uses Web Speech API (SpeechRecognition) where available
 *
 * Usage:
 *   const { isSupported, isListening, transcript, startListening, stopListening } = useSpeechRecognition()
 */
export function useSpeechRecognition(language = 'en-US'): UseSpeechRecognitionReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<InstanceType<SpeechRecognitionAPI> | null>(null)
  const interimTranscriptRef = useRef('')

  // Initialize speech recognition on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    // Check browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    setIsSupported(true)

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    // Configure recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language

    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      interimTranscriptRef.current = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcript + ' ')
        } else {
          interimTranscriptRef.current += transcript
        }
      }
    }

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = getErrorMessage(event.error)
      setError(errorMessage)
      setIsListening(false)
    }

    // Handle start
    recognition.onstart = () => {
      setError(null)
      setIsListening(true)
    }

    // Handle end
    recognition.onend = () => {
      setIsListening(false)
    }

    return () => {
      recognition.stop()
    }
  }, [language])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) {
      return
    }

    setError(null)
    interimTranscriptRef.current = ''

    try {
      recognitionRef.current.start()
    } catch (err) {
      // Already started, ignore
    }
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return
    }

    try {
      recognitionRef.current.stop()
    } catch (err) {
      // Not started, ignore
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    interimTranscriptRef.current = ''
    setError(null)
  }, [])

  return {
    isSupported,
    isListening,
    transcript: transcript + interimTranscriptRef.current,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}

/**
 * Map Web Speech API error codes to user-friendly messages
 */
function getErrorMessage(error: string): string {
  const errorMap: Record<string, string> = {
    'no-speech':
      'No speech was detected. Please try speaking into the microphone again.',
    'audio-capture': 'No microphone was found. Ensure it is connected and enabled.',
    'not-allowed': 'Microphone access was denied. Please allow access in your browser settings.',
    'network': 'Network error. Please check your connection and try again.',
    'service-not-allowed': 'Speech recognition is not allowed. Your browser may block this feature.',
  }

  return (
    errorMap[error] || `An error occurred: ${error}. Please try again.`
  )
}
