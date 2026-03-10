import { useState } from 'react'

const ACTIVITY_TYPES = [
  { value: 'Run', label: '🏃 Run' },
  { value: 'Ride', label: '🚴 Ride' },
  { value: 'Swim', label: '🏊 Swim' },
  { value: 'Hike', label: '🥾 Hike' },
  { value: 'Walk', label: '🚶 Walk' },
  { value: 'TrailRun', label: '🏔️ Trail Run' },
  { value: 'Workout', label: '💪 Workout' },
]

export default function ManualEntryForm({ initial, onActivityLoaded, onBack }) {
  const [type, setType] = useState(initial?.type || 'Run')
  const [name, setName] = useState(initial?.name || '')
  const [distance, setDistance] = useState(
    initial?.distance ? (initial.distance / 1000).toFixed(2) : '',
  )
  const [pace, setPace] = useState(initial?.avgPace ? formatPaceInput(initial.avgPace) : '')
  const [speed, setSpeed] = useState(
    initial?.avgSpeed ? (initial.avgSpeed * 3.6).toFixed(1) : '',
  )
  const [time, setTime] = useState(initial?.movingTime ? formatTimeInput(initial.movingTime) : '')
  const [elevation, setElevation] = useState(
    initial?.elevationGain != null ? String(Math.round(initial.elevationGain)) : '',
  )
  const [calories, setCalories] = useState(
    initial?.calories != null ? String(Math.round(initial.calories)) : '',
  )
  const [heartRate, setHeartRate] = useState(
    initial?.avgHeartRate != null ? String(Math.round(initial.avgHeartRate)) : '',
  )
  const [error, setError] = useState('')

  const isPace = ['Run', 'VirtualRun', 'TrailRun', 'Swim'].includes(type)
  const isSwim = type === 'Swim'

  function handleSubmit() {
    // Basic validation
    if (!distance && !time) {
      setError('Enter at least a distance or time.')
      return
    }

    // Parse pace/speed to m/s
    let avgSpeed = null
    if (isPace && pace) {
      avgSpeed = parsePaceToMs(pace)
    } else if (!isPace && speed) {
      avgSpeed = parseFloat(speed) / 3.6
    }

    const activity = {
      id: Date.now(),
      name: name || `${type} Activity`,
      type,
      date: new Date().toISOString(),
      distance: distance ? parseFloat(distance) * 1000 : null,
      movingTime: time ? parseTimeToSeconds(time) : null,
      avgSpeed,
      avgPace: avgSpeed,
      elevationGain: elevation ? parseFloat(elevation) : null,
      calories: calories ? parseFloat(calories) : null,
      avgHeartRate: heartRate ? parseFloat(heartRate) : null,
    }

    setError('')
    onActivityLoaded(activity)
  }

  return (
    <div className="px-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <h2 className="text-white text-lg font-bold">Manual Entry</h2>
      </div>

      {/* Activity type picker */}
      <div className="mb-5">
        <label className="text-white/50 text-xs font-medium mb-2 block">Activity Type</label>
        <div className="flex gap-2 flex-wrap">
          {ACTIVITY_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className="px-3 h-9 rounded-xl text-sm font-medium transition-all"
              style={{
                background: type === t.value ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)',
                color: type === t.value ? '#fff' : 'rgba(255,255,255,0.45)',
                border: type === t.value ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4 bg-red-400/10 rounded-xl px-4 py-3">{error}</p>
      )}

      <div className="flex flex-col gap-4">
        {/* Activity name */}
        <Field label="Activity Name (optional)">
          <input
            className="input-dark"
            placeholder={`My ${type}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        {/* Distance */}
        <Field label="Distance" hint="km">
          <input
            className="input-dark"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
          />
        </Field>

        {/* Pace or Speed */}
        {isPace ? (
          <Field
            label={isSwim ? 'Avg Pace' : 'Avg Pace'}
            hint={isSwim ? 'MM:SS /100m' : 'MM:SS /km'}
          >
            <input
              className="input-dark"
              placeholder={isSwim ? '1:45' : '5:30'}
              value={pace}
              onChange={(e) => setPace(e.target.value)}
            />
          </Field>
        ) : (
          <Field label="Avg Speed" hint="km/h">
            <input
              className="input-dark"
              type="number"
              inputMode="decimal"
              placeholder="25.0"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
            />
          </Field>
        )}

        {/* Moving time */}
        <Field label="Moving Time" hint="H:MM:SS or M:SS">
          <input
            className="input-dark"
            placeholder="1:05:30"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </Field>

        {/* Elevation */}
        {type !== 'Swim' && (
          <Field label="Elevation Gain" hint="m">
            <input
              className="input-dark"
              type="number"
              inputMode="decimal"
              placeholder="120"
              value={elevation}
              onChange={(e) => setElevation(e.target.value)}
            />
          </Field>
        )}

        {/* Calories */}
        <Field label="Calories" hint="kcal">
          <input
            className="input-dark"
            type="number"
            inputMode="decimal"
            placeholder="450"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </Field>

        {/* Heart rate */}
        <Field label="Avg Heart Rate" hint="bpm">
          <input
            className="input-dark"
            type="number"
            inputMode="decimal"
            placeholder="155"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
          />
        </Field>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full h-12 rounded-2xl font-semibold text-sm text-black mt-6"
        style={{ background: '#fff' }}
      >
        Apply Stats
      </button>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-white/50 text-xs font-medium">{label}</label>
        {hint && <span className="text-white/25 text-xs">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatPaceInput(mps) {
  if (!mps) return ''
  const secsPerKm = 1000 / mps
  const m = Math.floor(secsPerKm / 60)
  const s = Math.round(secsPerKm % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function parsePaceToMs(paceStr) {
  // Accepts "MM:SS"
  const parts = paceStr.split(':')
  if (parts.length < 2) return null
  const m = parseInt(parts[0], 10) || 0
  const s = parseInt(parts[1], 10) || 0
  const secsPerKm = m * 60 + s
  if (secsPerKm <= 0) return null
  return 1000 / secsPerKm
}

function formatTimeInput(seconds) {
  if (!seconds) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

function parseTimeToSeconds(timeStr) {
  const parts = timeStr.split(':').map((p) => parseInt(p, 10) || 0)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parts[0]
}
