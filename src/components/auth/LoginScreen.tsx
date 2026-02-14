'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/ui'

interface LoginScreenProps {
  onSkip?: () => void
}

const EMAIL_DOMAINS = ['@gmail.com', '@yahoo.com', '@outlook.com', '@icloud.com', '@hotmail.com']

export function LoginScreen({ onSkip }: LoginScreenProps) {
  const { sendOtpCode, verifyOtpCode, isConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const hasAutoSubmitted = useRef(false)

  // Show domain suggestions when user has typed something but no @ yet
  const showDomainSuggestions = email.length > 0 && !email.includes('@')

  const handleDomainSelect = (domain: string) => {
    setEmail(email + domain)
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError(null)

    const { error } = await sendOtpCode(email)

    setIsLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setCodeSent(true)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()

    const code = otpCode.replace(/\s/g, '')

    if (code.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    setIsLoading(true)
    setError(null)

    const { error } = await verifyOtpCode(email, code)

    if (error) {
      setIsLoading(false)
      setError(error.message)
      setOtpCode('')
    } else {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsLoading(true)
    setError(null)
    setResendSuccess(false)
    hasAutoSubmitted.current = false

    const { error } = await sendOtpCode(email)

    setIsLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 3000)
    }
  }

  const handleChangeEmail = () => {
    setCodeSent(false)
    setOtpCode('')
    setError(null)
    hasAutoSubmitted.current = false
  }

  // Auto-verify when 6 digits entered
  const autoVerify = useCallback(async (code: string) => {
    if (code.length !== 6 || isLoading || hasAutoSubmitted.current) return

    hasAutoSubmitted.current = true
    setIsLoading(true)
    setError(null)

    const { error } = await verifyOtpCode(email, code)

    if (error) {
      setIsLoading(false)
      setError(error.message)
      hasAutoSubmitted.current = false
      setOtpCode('')
    } else {
      setIsLoading(false)
    }
  }, [email, isLoading, verifyOtpCode])

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (codeSent && otpCode.length === 6 && !hasAutoSubmitted.current) {
      autoVerify(otpCode)
    }
  }, [otpCode, codeSent, autoVerify])

  // Try WebOTP API for auto-detection (works with SMS on supported browsers)
  useEffect(() => {
    if (!codeSent) return

    const abortController = new AbortController()

    // Check if WebOTP API is available
    if ('OTPCredential' in window) {
      navigator.credentials.get({
        // @ts-expect-error - WebOTP API types not fully supported
        otp: { transport: ['sms'] },
        signal: abortController.signal
      }).then((credential) => {
        // @ts-expect-error - WebOTP credential type
        if (credential?.code) {
          // @ts-expect-error - WebOTP credential type
          setOtpCode(credential.code)
        }
      }).catch(() => {
        // WebOTP not available or user denied - ignore
      })
    }

    return () => abortController.abort()
  }, [codeSent])

  // OTP code entry screen
  if (codeSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#2C3E50] to-[#1a252f]">
        <div className="mb-8">
          <Logo size="lg" showText={false} />
        </div>

        {/* Email Icon */}
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">Enter verification code</h2>

        <p className="text-gray-300 text-center mb-2 max-w-xs">
          We sent a 6-digit code to
        </p>
        <p className="text-white font-medium mb-6">{email}</p>

        <form onSubmit={handleVerifyCode} className="w-full max-w-xs space-y-4">
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              disabled={isLoading}
              autoFocus
              autoComplete="one-time-code"
              className="w-full px-4 py-4 rounded-lg bg-white/10 border border-white/20 text-white text-center text-2xl font-mono tracking-[0.3em] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
            />
            {/* Paste from clipboard button */}
            {otpCode.length < 6 && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText()
                    const digits = text.replace(/[^0-9]/g, '').slice(0, 6)
                    if (digits.length > 0) {
                      setOtpCode(digits)
                    }
                  } catch {
                    // Clipboard access denied - ignore
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
              >
                Paste
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || otpCode.length !== 6}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify & Sign In'
            )}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-red-400 text-sm text-center max-w-xs">{error}</p>
        )}

        {resendSuccess && (
          <p className="mt-4 text-green-400 text-sm text-center max-w-xs">New code sent! Check your email.</p>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={handleResend}
            disabled={isLoading}
            className="text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-50"
          >
            Resend code
          </button>
          <button
            onClick={handleChangeEmail}
            className="text-gray-400 hover:text-white text-sm underline transition-colors"
          >
            Use a different email
          </button>
        </div>

        {onSkip && (
          <button
            onClick={onSkip}
            className="mt-4 text-gray-500 hover:text-gray-300 text-xs transition-colors"
          >
            Continue without account
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#2C3E50] to-[#1a252f]">
      {/* Logo */}
      <div className="mb-8">
        <Logo size="lg" showText={false} />
      </div>

      {/* App Name */}
      <h1 className="text-3xl font-black text-white mb-2">
        <span className="text-green-500">REP</span>
        <span className="text-orange-500">PIT</span>
      </h1>
      <p className="text-gray-400 text-center mb-8 max-w-xs">
        Track your reps. Build your strength. See your progress.
      </p>

      {/* Features */}
      <div className="w-full max-w-xs mb-8 space-y-3">
        <div className="flex items-center gap-3 text-white/80">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm">Sync across all your devices</span>
        </div>
        <div className="flex items-center gap-3 text-white/80">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm">Works offline, syncs when online</span>
        </div>
        <div className="flex items-center gap-3 text-white/80">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm">Secure cloud backup</span>
        </div>
      </div>

      {/* Sign In Form */}
      {isConfigured ? (
        <form onSubmit={handleSendCode} className="w-full max-w-xs space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
              autoComplete="email"
              autoFocus
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
            />

            {/* Domain quick-select buttons */}
            {showDomainSuggestions && (
              <div className="flex flex-wrap gap-1.5">
                {EMAIL_DOMAINS.map(domain => (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => handleDomainSelect(domain)}
                    disabled={isLoading}
                    className="px-2.5 py-1 text-xs rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white border border-white/10 transition-colors disabled:opacity-50"
                  >
                    {domain}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Sign-In Code
              </>
            )}
          </button>

          <p className="text-gray-500 text-xs text-center">
            No password needed. We&apos;ll email you a 6-digit code.
          </p>
        </form>
      ) : (
        <div className="w-full max-w-xs text-center text-amber-400 text-sm bg-amber-400/10 p-3 rounded-lg">
          Cloud sync not configured. Using local storage only.
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-4 text-red-400 text-sm text-center max-w-xs">
          {error}
        </p>
      )}

      {/* Skip Button */}
      {onSkip && (
        <button
          onClick={onSkip}
          className="mt-6 text-gray-400 hover:text-white text-sm underline transition-colors"
        >
          Continue without account
        </button>
      )}

      {/* Privacy Note */}
      <p className="mt-8 text-gray-500 text-xs text-center max-w-xs">
        By signing in, you agree to our Privacy Policy. Your data is encrypted and secure.
      </p>
    </div>
  )
}
