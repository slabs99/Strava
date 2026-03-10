import { useState, useEffect } from 'react'
import Canvas from './components/Canvas.jsx'
import ActivitySheet from './components/ActivitySheet.jsx'
import StravaCallback from './components/StravaCallback.jsx'
import { useSessionState } from './hooks/useSession.js'
import { getStatDefs } from './utils/format.js'

/**
 * Default enabled stats: all on
 */
function defaultEnabledStats(activityType) {
  const defs = getStatDefs(activityType || 'Run')
  return Object.fromEntries(defs.map((d) => [d.key, true]))
}

export default function App() {
  // Check if this is an OAuth callback
  const params = new URLSearchParams(window.location.search)
  const isCallback = params.has('code') || params.has('error')

  const [image, setImage] = useSessionState('stride_image', null)
  const [activity, setActivity] = useSessionState('stride_activity', null)
  const [activityType, setActivityType] = useSessionState('stride_activity_type', 'Run')
  const [enabledStats, setEnabledStats] = useSessionState('stride_enabled_stats', null)
  const [statsPos, setStatsPos] = useSessionState('stride_stats_pos', { x: 10, y: 55 })
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetView, setSheetView] = useState('main') // 'main' | 'strava' | 'manual' | 'toggles'

  // Initialise enabled stats when activity type changes
  useEffect(() => {
    if (!enabledStats) {
      setEnabledStats(defaultEnabledStats(activityType))
    }
  }, [activityType, enabledStats, setEnabledStats])

  function handleActivityLoaded(act) {
    setActivity(act)
    const type = act.type || activityType
    setActivityType(type)
    setEnabledStats(defaultEnabledStats(type))
    setSheetOpen(false)
  }

  function handleClearAll() {
    setActivity(null)
    setImage(null)
    setEnabledStats(defaultEnabledStats(activityType))
    setStatsPos({ x: 10, y: 55 })
  }

  function openSheet(view = 'main') {
    setSheetView(view)
    setSheetOpen(true)
  }

  if (isCallback) {
    return <StravaCallback />
  }

  return (
    <div className="flex items-center justify-center w-full h-full bg-black">
      <Canvas
        image={image}
        activity={activity}
        activityType={activityType}
        enabledStats={enabledStats}
        statsPos={statsPos}
        onStatsPos={setStatsPos}
        onImageChange={setImage}
        onOpenSheet={openSheet}
        onClearAll={handleClearAll}
      />

      {sheetOpen && (
        <ActivitySheet
          view={sheetView}
          onViewChange={setSheetView}
          activity={activity}
          activityType={activityType}
          enabledStats={enabledStats}
          onEnabledStatsChange={setEnabledStats}
          onActivityLoaded={handleActivityLoaded}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  )
}
