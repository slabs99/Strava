import { useRef, useState, useCallback } from 'react'
import {
  formatDistance,
  formatPace,
  formatSwimPace,
  formatSpeed,
  formatTime,
  getStatDefs,
  activityTypeLabel,
  activityEmoji,
} from '../utils/format.js'

export default function StatsOverlay({
  activity,
  activityType,
  enabledStats,
  position,
  onPosition,
  containerRef,
}) {
  const overlayRef = useRef(null)
  const dragState = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const statDefs = getStatDefs(activityType)
  const visibleStats = statDefs.filter((d) => enabledStats?.[d.key])

  if (visibleStats.length === 0) return null

  // ─── Drag logic ─────────────────────────────────────────────────────────────
  function startDrag(clientX, clientY) {
    const container = containerRef.current
    const overlay = overlayRef.current
    if (!container || !overlay) return
    const cRect = container.getBoundingClientRect()
    const oRect = overlay.getBoundingClientRect()
    dragState.current = {
      startX: clientX,
      startY: clientY,
      startPosX: ((oRect.left - cRect.left) / cRect.width) * 100,
      startPosY: ((oRect.top - cRect.top) / cRect.height) * 100,
      cW: cRect.width,
      cH: cRect.height,
      oW: oRect.width,
      oH: oRect.height,
    }
    setIsDragging(true)
  }

  function moveDrag(clientX, clientY) {
    if (!dragState.current) return
    const { startX, startY, startPosX, startPosY, cW, cH, oW, oH } = dragState.current
    const dx = ((clientX - startX) / cW) * 100
    const dy = ((clientY - startY) / cH) * 100
    const maxX = ((cW - oW) / cW) * 100
    const maxY = ((cH - oH) / cH) * 100
    const newX = Math.max(0, Math.min(maxX, startPosX + dx))
    const newY = Math.max(0, Math.min(maxY, startPosY + dy))
    onPosition({ x: newX, y: newY })
  }

  function endDrag() {
    dragState.current = null
    setIsDragging(false)
  }

  // Touch handlers
  function onTouchStart(e) {
    const t = e.touches[0]
    startDrag(t.clientX, t.clientY)
  }

  function onTouchMove(e) {
    e.preventDefault()
    const t = e.touches[0]
    moveDrag(t.clientX, t.clientY)
  }

  function onTouchEnd() {
    endDrag()
  }

  // Mouse handlers (for desktop preview)
  function onMouseDown(e) {
    e.preventDefault()
    startDrag(e.clientX, e.clientY)

    function onMove(ev) { moveDrag(ev.clientX, ev.clientY) }
    function onUp() {
      endDrag()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ─── Stat value resolver ──────────────────────────────────────────────────
  function resolveValue(def) {
    if (!activity) return '--'
    switch (def.key) {
      case 'distance':
        return formatDistance(activity.distance)
      case 'avgPace': {
        const isSwim = activityType === 'Swim'
        return isSwim
          ? formatSwimPace(activity.avgPace || activity.avgSpeed)
          : formatPace(activity.avgPace || activity.avgSpeed)
      }
      case 'avgSpeed':
        return formatSpeed(activity.avgSpeed)
      case 'movingTime':
        return formatTime(activity.movingTime)
      case 'elevationGain':
        return activity.elevationGain != null
          ? Math.round(activity.elevationGain).toString()
          : '--'
      case 'calories':
        return activity.calories != null ? Math.round(activity.calories).toString() : '--'
      case 'avgHeartRate':
        return activity.avgHeartRate != null
          ? Math.round(activity.avgHeartRate).toString()
          : '--'
      default:
        return '--'
    }
  }

  const mainStat = visibleStats.find((d) => d.key === 'distance') || visibleStats[0]
  const secondaryStats = visibleStats.filter((d) => d.key !== mainStat.key)

  return (
    <div
      ref={overlayRef}
      className="absolute select-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        maxWidth: '80%',
        minWidth: '200px',
        zIndex: 10,
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="rounded-2xl px-4 py-4"
        style={{
          background: 'rgba(0, 0, 0, 0.38)',
          backdropFilter: 'blur(28px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
          border: '1px solid rgba(255,255,255,0.16)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Activity type badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs">{activityEmoji(activityType)}</span>
          <span
            className="text-[11px] font-medium tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {activityTypeLabel(activityType)}
          </span>
        </div>

        {/* Main stat */}
        <div className="mb-3">
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-black tracking-tight stat-value"
              style={{ fontSize: '2.4rem', lineHeight: 1, color: '#fff' }}
            >
              {resolveValue(mainStat)}
            </span>
            {mainStat.unit && (
              <span
                className="text-base font-semibold"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                {mainStat.unit}
              </span>
            )}
          </div>
          <p className="text-[11px] mt-0.5 font-medium tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {mainStat.label}
          </p>
        </div>

        {/* Divider */}
        {secondaryStats.length > 0 && (
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.10)', marginBottom: '12px' }} />
        )}

        {/* Secondary stats grid */}
        {secondaryStats.length > 0 && (
          <div
            className="grid gap-x-4 gap-y-3"
            style={{
              gridTemplateColumns: secondaryStats.length === 1 ? '1fr' : 'repeat(2, 1fr)',
            }}
          >
            {secondaryStats.map((def) => (
              <StatCell key={def.key} def={def} value={resolveValue(def)} />
            ))}
          </div>
        )}
      </div>

      {/* Drag hint */}
      {isDragging && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: '1.5px solid rgba(255,255,255,0.35)' }}
        />
      )}
    </div>
  )
}

function StatCell({ def, value }) {
  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span
          className="font-bold tracking-tight"
          style={{ fontSize: '1.2rem', color: '#fff', lineHeight: 1 }}
        >
          {value}
        </span>
        {def.unit && (
          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {def.unit}
          </span>
        )}
      </div>
      <p className="text-[10px] mt-0.5 font-medium tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {def.label}
      </p>
    </div>
  )
}
