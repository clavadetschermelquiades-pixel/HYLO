const TABS = [
  { id: 'dashboard', label: 'Übersicht', icon: '🏠' },
  { id: 'log', label: 'Loggen', icon: '➕' },
  { id: 'morning', label: 'Morgencheck', icon: '☀️' },
  { id: 'history', label: 'Verlauf', icon: '📜' },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={active === tab.id ? 'active' : ''}
          onClick={() => onChange(tab.id)}
        >
          <span className="icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
