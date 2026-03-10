import { useRef, useState, useCallback } from 'react'
import StatsOverlay from './StatsOverlay.jsx'

export default function Canvas({
  image,
  activity,
  activityType,
  enabledStats,
  statsPos,
  onStatsPos,
  onImageChange,
  onOpenSheet,
  onClearAll,
}) {
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)

  // ─── Image upload ──────────────────────────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onImageChange(ev.target.result)
    reader.readAsDataURL(file)
    // Reset so same file can be re-selected
    e.target.value = ''
  }

  function handleCanvasTap(e) {
    // Tap on empty canvas without image → open file picker
    if (!image) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div
      className="relative overflow-hidden bg-black"
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '430px',
        maxHeight: '100dvh',
      }}
    >
      {/* ── Background image or empty state ── */}
      <div
        ref={canvasRef}
        className="absolute inset-0 flex flex-col items-center justify-center"
        onClick={handleCanvasTap}
        style={{ cursor: image ? 'default' : 'pointer' }}
      >
        {image ? (
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
          />
        ) : (
          <EmptyState />
        )}
      </div>

      {/* ── Stats overlay ── */}
      {activity && enabledStats && (
        <StatsOverlay
          activity={activity}
          activityType={activityType}
          enabledStats={enabledStats}
          position={statsPos}
          onPosition={onStatsPos}
          containerRef={canvasRef}
        />
      )}

      {/* ── Top bar ── */}
      <TopBar image={image} activity={activity} onClearAll={onClearAll} onChangePhoto={() => fileInputRef.current?.click()} />

      {/* ── Bottom action bar ── */}
      <BottomBar
        hasImage={!!image}
        hasActivity={!!activity}
        onAddPhoto={() => fileInputRef.current?.click()}
        onOpenStats={() => onOpenSheet('main')}
        onOpenToggles={() => onOpenSheet('toggles')}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-5 px-8 text-center select-none">
      {/* Big dashed border area */}
      <div
        className="w-48 h-48 rounded-3xl flex items-center justify-center"
        style={{
          border: '2px dashed rgba(255,255,255,0.18)',
          background: 'rgba(255,255,255,0.04)',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div>
        <p className="text-white text-base font-semibold tracking-tight">Add a photo</p>
        <p className="text-white/40 text-sm mt-1">Tap to choose from your library</p>
      </div>
    </div>
  )
}

// ─── Top bar ──────────────────────────────────────────────────────────────────
function TopBar({ image, activity, onClearAll, onChangePhoto }) {
  if (!image && !activity) return null

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 pb-2"
      style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)' }}
    >
      <span className="text-white font-bold text-lg tracking-tight">stride</span>
      <div className="flex items-center gap-2">
        {image && (
          <button
            onClick={onChangePhoto}
            className="rounded-full px-3 h-8 text-xs font-medium text-white/70 flex items-center gap-1"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Photo
          </button>
        )}
        <button
          onClick={onClearAll}
          className="rounded-full w-8 h-8 flex items-center justify-center text-white/60"
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
          aria-label="Clear all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Bottom action bar ────────────────────────────────────────────────────────
function BottomBar({ hasImage, hasActivity, onAddPhoto, onOpenStats, onOpenToggles }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 pb-8 pt-4"
      style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
      }}
    >
      {/* Left: photo button (always shown) */}
      <button
        onClick={onAddPhoto}
        className="flex flex-col items-center gap-1"
        aria-label="Add photo"
      >
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="15" rx="2" stroke="white" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="3.5" stroke="white" strokeWidth="1.5" />
            <path d="M8 5l1.5-2h5L16 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-white/50 text-[10px] font-medium">Photo</span>
      </button>

      {/* Center: main CTA */}
      <button
        onClick={onOpenStats}
        className="flex items-center gap-2 px-6 h-12 rounded-2xl font-semibold text-sm text-white"
        style={{
          background: hasActivity
            ? 'rgba(255,255,255,0.15)'
            : 'rgba(255,255,255,0.95)',
          color: hasActivity ? 'white' : 'black',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        {hasActivity ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Edit Stats
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Add Stats
          </>
        )}
      </button>

      {/* Right: toggles (only when activity loaded) */}
      {hasActivity ? (
        <button
          onClick={onOpenToggles}
          className="flex flex-col items-center gap-1"
          aria-label="Toggle stats"
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h10M4 18h7"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-white/50 text-[10px] font-medium">Fields</span>
        </button>
      ) : (
        <div className="w-11" /> /* spacer */
      )}
    </div>
  )
}
