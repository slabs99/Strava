import { useEffect, useState } from 'react'
import {
  getCredentials,
  exchangeCodeForToken,
  saveTokens,
  clearStravaSession,
} from '../utils/strava.js'

/**
 * Handles the Strava OAuth redirect callback.
 * Exchanges the code for tokens and redirects back to app root.
 */
export default function StravaCallback() {
  const [status, setStatus] = useState('Connecting to Strava…')
  const [error, setError] = useState(null)

  useEffect(() => {
    handleCallback()
  }, [])

  async function handleCallback() {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const errParam = params.get('error')

    if (errParam) {
      setError(`Strava declined access: ${errParam}`)
      return
    }

    if (!code) {
      setError('No authorization code received.')
      return
    }

    const { clientId, clientSecret } = getCredentials()
    if (!clientId || !clientSecret) {
      setError('Session expired — credentials missing. Please reconnect.')
      return
    }

    try {
      setStatus('Exchanging token…')
      const data = await exchangeCodeForToken(code, clientId, clientSecret)
      saveTokens(data)
      setStatus('Connected! Redirecting…')
      // Clean URL and go back to app
      window.history.replaceState({}, '', window.location.pathname)
      window.location.reload()
    } catch (e) {
      setError(e.message || 'Token exchange failed')
    }
  }

  function handleRetry() {
    clearStravaSession()
    window.history.replaceState({}, '', window.location.pathname)
    window.location.reload()
  }

  return (
    <div
      className="flex flex-col items-center justify-center h-full bg-black px-8 text-center"
      style={{ maxWidth: '430px', margin: '0 auto' }}
    >
      {error ? (
        <>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'rgba(239,68,68,0.15)' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="rgb(239,68,68)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-white font-semibold text-lg mb-2">Connection Failed</p>
          <p className="text-white/50 text-sm mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="h-12 px-6 rounded-2xl font-semibold text-sm text-black"
            style={{ background: '#fff' }}
          >
            Try Again
          </button>
        </>
      ) : (
        <>
          <Spinner />
          <p className="text-white/60 text-sm mt-4">{status}</p>
        </>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <div
      className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white/70"
      style={{ animation: 'spin 0.7s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
