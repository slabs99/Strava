import { useEffect, useRef } from 'react'

/**
 * Reusable bottom sheet with backdrop + drag-to-dismiss feel
 */
export default function BottomSheet({ onClose, children, fullHeight = false }) {
  const sheetRef = useRef(null)

  // Close on backdrop tap
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="absolute inset-0 z-50 flex items-end"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdropClick}
    >
      <div
        ref={sheetRef}
        className="w-full sheet-scroll"
        style={{
          background: '#111',
          borderTop: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '20px 20px 0 0',
          maxHeight: fullHeight ? '92%' : '75%',
          animation: 'slideUp 0.32s cubic-bezier(0.32,0.72,0,1)',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>
        <div className="drag-handle mt-3 mb-0" />
        {children}
      </div>
    </div>
  )
}
