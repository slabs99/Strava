import { getStatDefs } from '../utils/format.js'

export default function StatToggles({ activityType, enabledStats, onChange, onDone }) {
  const defs = getStatDefs(activityType)

  function toggle(key) {
    onChange((prev) => ({ ...prev, [key]: !prev?.[key] }))
  }

  const enabledCount = defs.filter((d) => enabledStats?.[d.key]).length

  return (
    <div className="px-5 pb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-white text-lg font-bold">Visible Fields</h2>
        <span className="text-white/40 text-sm">{enabledCount} shown</span>
      </div>
      <p className="text-white/40 text-sm mb-6">Toggle which stats appear on your image</p>

      <div className="flex flex-col gap-2">
        {defs.map((def) => (
          <ToggleRow
            key={def.key}
            label={def.label}
            unit={def.unit}
            enabled={enabledStats?.[def.key] ?? true}
            onToggle={() => toggle(def.key)}
          />
        ))}
      </div>

      <button
        onClick={onDone}
        className="w-full h-12 rounded-2xl font-semibold text-sm text-black mt-6"
        style={{ background: '#fff' }}
      >
        Done
      </button>
    </div>
  )
}

function ToggleRow({ label, unit, enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between rounded-xl px-4 h-14 active:scale-[0.98] transition-transform"
      style={{
        background: enabled ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${enabled ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: enabled ? '#fff' : 'rgba(255,255,255,0.2)' }}
        />
        <span
          className="text-sm font-medium"
          style={{ color: enabled ? '#fff' : 'rgba(255,255,255,0.4)' }}
        >
          {label}
        </span>
        {unit && (
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {unit}
          </span>
        )}
      </div>

      {/* Toggle */}
      <div
        className="toggle-bg w-11 h-6 rounded-full relative flex-shrink-0 transition-all"
        style={{ background: enabled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)' }}
      >
        <div
          className="absolute top-0.5 bottom-0.5 aspect-square rounded-full transition-all duration-200"
          style={{
            background: enabled ? '#000' : 'rgba(255,255,255,0.5)',
            left: enabled ? 'calc(100% - 2px - 20px)' : '2px',
          }}
        />
      </div>
    </button>
  )
}
