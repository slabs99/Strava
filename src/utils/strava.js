/**
 * Strava OAuth + API utilities
 * Uses client_id + client_secret stored in sessionStorage (personal use)
 */

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize'
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'
const STRAVA_API_URL = 'https://www.strava.com/api/v3'
const SCOPE = 'activity:read_all'

// ─── Session storage keys ─────────────────────────────────────────────────────
const KEYS = {
  clientId: 'stride_strava_client_id',
  clientSecret: 'stride_strava_client_secret',
  accessToken: 'stride_strava_access_token',
  refreshToken: 'stride_strava_refresh_token',
  expiresAt: 'stride_strava_expires_at',
  athlete: 'stride_strava_athlete',
}

export function getCredentials() {
  return {
    clientId: sessionStorage.getItem(KEYS.clientId) || '',
    clientSecret: sessionStorage.getItem(KEYS.clientSecret) || '',
  }
}

export function saveCredentials(clientId, clientSecret) {
  sessionStorage.setItem(KEYS.clientId, clientId)
  sessionStorage.setItem(KEYS.clientSecret, clientSecret)
}

export function getAccessToken() {
  return sessionStorage.getItem(KEYS.accessToken)
}

export function isTokenValid() {
  const token = sessionStorage.getItem(KEYS.accessToken)
  const expiresAt = parseInt(sessionStorage.getItem(KEYS.expiresAt) || '0', 10)
  return token && Date.now() / 1000 < expiresAt - 60
}

export function saveTokens(data) {
  sessionStorage.setItem(KEYS.accessToken, data.access_token)
  sessionStorage.setItem(KEYS.refreshToken, data.refresh_token)
  sessionStorage.setItem(KEYS.expiresAt, String(data.expires_at))
  if (data.athlete) {
    sessionStorage.setItem(KEYS.athlete, JSON.stringify(data.athlete))
  }
}

export function getAthlete() {
  const raw = sessionStorage.getItem(KEYS.athlete)
  return raw ? JSON.parse(raw) : null
}

export function clearStravaSession() {
  Object.values(KEYS).forEach((k) => sessionStorage.removeItem(k))
}

// ─── OAuth redirect ────────────────────────────────────────────────────────────
export function redirectToStravaAuth(clientId) {
  const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname)
  const url = `${STRAVA_AUTH_URL}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&approval_prompt=auto&scope=${SCOPE}`
  window.location.href = url
}

// ─── Token exchange ────────────────────────────────────────────────────────────
export async function exchangeCodeForToken(code, clientId, clientSecret) {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Token exchange failed: ${res.status}`)
  }
  return res.json()
}

// ─── Refresh token ─────────────────────────────────────────────────────────────
export async function refreshAccessToken() {
  const { clientId, clientSecret } = getCredentials()
  const refreshToken = sessionStorage.getItem(KEYS.refreshToken)
  if (!clientId || !clientSecret || !refreshToken) throw new Error('Missing credentials')

  const res = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error('Token refresh failed')
  const data = await res.json()
  saveTokens(data)
  return data.access_token
}

// ─── API calls ─────────────────────────────────────────────────────────────────
async function apiFetch(path) {
  let token = getAccessToken()
  if (!token) throw new Error('Not authenticated')

  // Refresh if expired
  if (!isTokenValid()) {
    token = await refreshAccessToken()
  }

  const res = await fetch(`${STRAVA_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (res.status === 401) {
    clearStravaSession()
    throw new Error('Session expired. Please reconnect Strava.')
  }

  if (!res.ok) {
    throw new Error(`Strava API error: ${res.status}`)
  }

  return res.json()
}

export async function fetchRecentActivities(perPage = 20) {
  return apiFetch(`/athlete/activities?per_page=${perPage}`)
}

export async function fetchActivity(id) {
  return apiFetch(`/activities/${id}`)
}

// ─── Map Strava activity to our internal format ────────────────────────────────
export function mapActivity(stravaActivity) {
  return {
    id: stravaActivity.id,
    name: stravaActivity.name,
    type: stravaActivity.sport_type || stravaActivity.type,
    date: stravaActivity.start_date_local,
    distance: stravaActivity.distance, // meters
    movingTime: stravaActivity.moving_time, // seconds
    elapsedTime: stravaActivity.elapsed_time,
    elevationGain: stravaActivity.total_elevation_gain, // meters
    avgSpeed: stravaActivity.average_speed, // m/s
    avgPace: stravaActivity.average_speed, // we compute pace from this
    maxSpeed: stravaActivity.max_speed,
    avgHeartRate: stravaActivity.average_heartrate,
    maxHeartRate: stravaActivity.max_heartrate,
    calories: stravaActivity.calories || stravaActivity.kilojoules,
    startCoords: stravaActivity.start_latlng,
    kudosCount: stravaActivity.kudos_count,
    mapPolyline: stravaActivity.map?.summary_polyline,
  }
}
