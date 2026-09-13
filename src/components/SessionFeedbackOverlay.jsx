export default function SessionFeedbackOverlay({ state, onClose }) {
  if (!state) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 50,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div className="card" style={{ width: '100%', maxWidth: 560, marginBottom: 0 }} onClick={(e) => e.stopPropagation()}>
        <h3>Feedback zur Einheit</h3>

        {state.loading && <div className="list-item-detail">Erstelle Feedback...</div>}

        {state.error && <div className="list-item-detail" style={{ color: 'var(--danger)' }}>{state.error}</div>}

        {state.text && (
          <div className="list-item-detail" style={{ whiteSpace: 'pre-wrap', marginBottom: 16 }}>
            {state.text}
          </div>
        )}

        <button className="btn btn-primary" onClick={onClose}>
          Schliessen
        </button>
      </div>
    </div>
  )
}
