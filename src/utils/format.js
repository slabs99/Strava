/**
 * Format seconds → H:MM:SS or M:SS
 */
export function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '--'
  const s = Math.round(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }
  return `${m}:${String(sec).padStart(2, '0')}`
}

/**
 * Format meters → km (1 decimal)
 */
export function formatDistance(meters) {
  if (!meters && meters !== 0) return '--'
  return (meters / 1000).toFixed(2)
}

/**
 * m/s → avg pace as MM:SS /km
 */
export function formatPace(metersPerSecond) {
  if (!metersPerSecond || metersPerSecond <= 0) return '--'
  const secsPerKm = 1000 / metersPerSecond
  const m = Math.floor(secsPerKm / 60)
  const s = Math.round(secsPerKm % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * m/s → km/h (1 decimal)
 */
export function formatSpeed(metersPerSecond) {
  if (!metersPerSecond && metersPerSecond !== 0) return '--'
  return (metersPerSecond * 3.6).toFixed(1)
}

/**
 * pace string MM:SS → formatted label
 */
export function paceLabel(activityType) {
  switch (activityType) {
    case 'Swim': return '/100m'
    case 'Run':
    case 'VirtualRun':
      return '/km'
    default: return '/km'
  }
}

/**
 * Determine speed metric label by sport type
 */
export function speedOrPaceUnit(activityType) {
  switch (activityType) {
    case 'Run':
    case 'VirtualRun':
    case 'TrailRun':
    case 'Swim':
      return 'pace'
    default:
      return 'speed'
  }
}

/**
 * Format swimming pace: m/s → MM:SS /100m
 */
export function formatSwimPace(metersPerSecond) {
  if (!metersPerSecond || metersPerSecond <= 0) return '--'
  const secsPer100m = 100 / metersPerSecond
  const m = Math.floor(secsPer100m / 60)
  const s = Math.round(secsPer100m % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Activity type → display label
 */
export function activityTypeLabel(type) {
  const map = {
    Run: 'Run',
    VirtualRun: 'Virtual Run',
    TrailRun: 'Trail Run',
    Ride: 'Ride',
    VirtualRide: 'Virtual Ride',
    EBikeRide: 'E-Bike',
    Swim: 'Swim',
    Hike: 'Hike',
    Walk: 'Walk',
    WeightTraining: 'Weights',
    Workout: 'Workout',
  }
  return map[type] || type || 'Activity'
}

/**
 * Activity type → emoji
 */
export function activityEmoji(type) {
  const map = {
    Run: '🏃',
    VirtualRun: '🏃',
    TrailRun: '🏔️',
    Ride: '🚴',
    VirtualRide: '🚴',
    EBikeRide: '⚡',
    Swim: '🏊',
    Hike: '🥾',
    Walk: '🚶',
    WeightTraining: '🏋️',
    Workout: '💪',
  }
  return map[type] || '🏅'
}

/**
 * Get ordered stat definitions for a given activity type
 */
export function getStatDefs(activityType) {
  const isPace = ['Run', 'VirtualRun', 'TrailRun', 'Swim'].includes(activityType)
  const isSwim = activityType === 'Swim'
  const hasElevation = !['Swim'].includes(activityType)

  const defs = [
    { key: 'distance', label: 'Distance', unit: 'km', size: 'large' },
    isPace
      ? {
          key: 'avgPace',
          label: 'Avg Pace',
          unit: isSwim ? '/100m' : '/km',
          size: 'normal',
        }
      : {
          key: 'avgSpeed',
          label: 'Avg Speed',
          unit: 'km/h',
          size: 'normal',
        },
    { key: 'movingTime', label: 'Moving Time', unit: '', size: 'normal' },
    ...(hasElevation
      ? [{ key: 'elevationGain', label: 'Elevation', unit: 'm', size: 'normal' }]
      : []),
    { key: 'calories', label: 'Calories', unit: 'kcal', size: 'normal' },
    { key: 'avgHeartRate', label: 'Avg HR', unit: 'bpm', size: 'normal' },
  ]

  return defs
}
