import BottomSheet from './BottomSheet.jsx'
import StravaConnect from './StravaConnect.jsx'
import ManualEntryForm from './ManualEntryForm.jsx'
import StatToggles from './StatToggles.jsx'

export default function ActivitySheet({
  view,
  onViewChange,
  activity,
  activityType,
  enabledStats,
  onEnabledStatsChange,
  onActivityLoaded,
  onClose,
}) {
  return (
    <BottomSheet onClose={onClose} fullHeight={view === 'strava' || view === 'manual'}>
      {view === 'main' && (
        <MainMenu
          hasActivity={!!activity}
          onStrava={() => onViewChange('strava')}
          onManual={() => onViewChange('manual')}
          onToggles={() => onViewChange('toggles')}
        />
      )}

      {view === 'strava' && (
        <StravaConnect
          onActivityLoaded={onActivityLoaded}
          onBack={() => onViewChange('main')}
        />
      )}

      {view === 'manual' && (
        <ManualEntryForm
          initial={activity}
          onActivityLoaded={onActivityLoaded}
          onBack={() => onViewChange('main')}
        />
      )}

      {view === 'toggles' && (
        <StatToggles
          activityType={activityType}
          enabledStats={enabledStats}
          onChange={onEnabledStatsChange}
          onDone={onClose}
        />
      )}
    </BottomSheet>
  )
}

// ─── Main menu ─────────────────────────────────────────────────────────────────
function MainMenu({ hasActivity, onStrava, onManual, onToggles }) {
  return (
    <div className="px-5 pb-8">
      <h2 className="text-white text-xl font-bold mb-1">Add Stats</h2>
      <p className="text-white/40 text-sm mb-6">Choose how to add activity data</p>

      <div className="flex flex-col gap-3">
        {/* Strava */}
        <MenuCard
          icon={<StravaIcon />}
          title="Import from Strava"
          subtitle="Connect your Strava account to pull real activity data"
          onClick={onStrava}
          accent="#fc4c02"
        />

        {/* Manual */}
        <MenuCard
          icon={<PencilIcon />}
          title="Enter Manually"
          subtitle="Type in your activity stats yourself"
          onClick={onManual}
          accent="rgba(255,255,255,0.8)"
        />

        {/* Toggles (only if activity loaded) */}
        {hasActivity && (
          <MenuCard
            icon={<SlidersIcon />}
            title="Edit Visible Fields"
            subtitle="Choose which stats appear on your image"
            onClick={onToggles}
            accent="rgba(255,255,255,0.8)"
          />
        )}
      </div>
    </div>
  )
}

function MenuCard({ icon, title, subtitle, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-[15px]">{title}</p>
        <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
      <ChevronIcon />
    </button>
  )
}

// ─── Icons ─────────────────────────────────────────────────────────────────────
function StravaIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066z" />
      <path d="M9.743 3.856l2.714 5.356H7.029z" opacity=".6" />
      <path d="M9.743 3.856L4.596 13.86h2.713l2.434-4.648 2.714 5.356h2.716z" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SlidersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 12h10M4 18h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
