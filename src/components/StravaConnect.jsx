import { useState, useEffect } from 'react'
import {
  isTokenValid,
  getAthlete,
  fetchRecentActivities,
  mapActivity,
  redirectToStravaAuth,
  clearStravaSession,
} from '../utils/strava.js'
import { activityEmoji, activityTypeLabel, formatDistance, formatTime } from '../utils/format.js'

const VIEWS = {
  CONNECT: 'connect',
  LOADING: 'loading',
  LIST: 'list',
  ERROR: 'error',
}

export default function StravaConnect({ onActivityLoaded, onBack }) {
  const isConnected = isTokenValid()
  const [view, setView] = useState(isConnected ? VIEWS.LOADING : VIEWS.CONNECT)
  const [activities, setActivities] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (isConnected) {
      loadActivities()
    }
  }, [isConnected])

  async function loadActivities() {
    setView(VIEWS.LOADING)
    try {
      const raw = await fetchRecentActivities(20)
      setActivities(raw.map(mapActivity))
      setView(VIEWS.LIST)
    } catch (e) {
      setError(e.message)
      setView(VIEWS.ERROR)
    }
  }

  function handleConnect() {
    redirectToStravaAuth()
  }

  function handleDisconnect() {
    clearStravaSession()
    setView(VIEWS.CONNECT)
    setActivities([])
  }

  const athlete = getAthlete()

  return (
    <div className="px-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div>
          <h2 className="text-white text-lg font-bold">Strava</h2>
          {athlete && <p className="text-white/40 text-xs">{athlete.firstname} {athlete.lastname}</p>}
        </div>
        {isConnected && (
          <button onClick={handleDisconnect} className="ml-auto text-xs text-white/40 underline">
            Disconnect
          </button>
        )}
      </div>

      {view === VIEWS.CONNECT && (
        <div className="flex flex-col items-center py-8">
          {/* Strava logo */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'rgba(252,76,2,0.15)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#FC4C02">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066z" />
              <path d="M9.743 3.856l2.714 5.356H7.029z" opacity=".7" />
              <path d="M9.743 3.856L4.596 13.86h2.713l2.434-4.648 2.714 5.356h2.716z" />
            </svg>
          </div>
          <p className="text-white/50 text-sm mb-6 text-center">
            Import your latest activities from Strava
          </p>
          <button
            onClick={handleConnect}
            className="strava-btn w-full h-12 text-sm flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066z" />
              <path d="M9.743 3.856l2.714 5.356H7.029z" opacity=".7" />
              <path d="M9.743 3.856L4.596 13.86h2.713l2.434-4.648 2.714 5.356h2.716z" />
            </svg>
            Connect with Strava
          </button>
        </div>
      )}

      {view === VIEWS.LOADING && (
        <div className="flex flex-col items-center py-12 gap-4">
          <Spinner />
          <p className="text-white/40 text-sm">Fetching your activities…</p>
        </div>
      )}

      {view === VIEWS.LIST && (
        <ActivityList activities={activities} onSelect={onActivityLoaded} />
      )}

      {view === VIEWS.ERROR && (
        <div className="text-center py-8">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => setView(isTokenValid() ? VIEWS.LOADING : VIEWS.CONNECT)}
            className="text-white/60 underline text-sm"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Activity list ─────────────────────────────────────────────────────────────
function ActivityList({ activities, onSelect }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-white/40 text-sm">
        No activities found in the last 20.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {activities.map((act) => (
        <ActivityRow key={act.id} activity={act} onSelect={() => onSelect(act)} />
      ))}
    </div>
  )
}

function ActivityRow({ activity, onSelect }) {
  const date = new Date(activity.date)
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const dist = formatDistance(activity.distance)
  const time = formatTime(activity.movingTime)

  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-xl p-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        {activityEmoji(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{activity.name}</p>
        <p className="text-white/40 text-xs mt-0.5">
          {activityTypeLabel(activity.type)} · {dateStr}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-white text-sm font-semibold">{dist} km</p>
        <p className="text-white/40 text-xs">{time}</p>
      </div>
    </button>
  )
}

function Spinner() {
  return (
    <div
      className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/70"
      style={{ animation: 'spin 0.7s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
