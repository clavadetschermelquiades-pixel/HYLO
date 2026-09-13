import { useEffect, useState, useCallback } from 'react'
import BottomNav from './components/BottomNav.jsx'
import Dashboard from './components/Dashboard.jsx'
import ActivityForm from './components/ActivityForm.jsx'
import MorningCheckForm from './components/MorningCheckForm.jsx'
import History from './components/History.jsx'
import SessionFeedbackOverlay from './components/SessionFeedbackOverlay.jsx'
import {
  getActivities,
  addActivity,
  deleteActivity,
  getMorningChecks,
  addMorningCheck,
  deleteMorningCheck,
} from './lib/storage.js'
import { formatDate, todayStr } from './lib/utils.js'
import { handleStravaRedirect, isStravaConnected, syncStravaActivities } from './lib/strava.js'
import { shouldAutoGenerate, generateReview } from './lib/weeklyReview.js'
import { getSessionFeedback } from './lib/sessionFeedback.js'

const TITLES = {
  dashboard: ['Hylo', `Heute: ${formatDate(todayStr())}`],
  log: ['Aktivität loggen', 'Lauf oder Krafttraining erfassen'],
  morning: ['Morgencheck', 'Gewicht, Ruhepuls & Schlaf'],
  history: ['Verlauf', 'Alle Einträge im Überblick'],
}

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [activities, setActivities] = useState([])
  const [morningChecks, setMorningChecks] = useState([])
  const [sessionFeedback, setSessionFeedback] = useState(null)

  const refresh = useCallback(() => {
    setActivities(getActivities())
    setMorningChecks(getMorningChecks())
  }, [])

  useEffect(() => {
    refresh()
    handleStravaRedirect()
      .then((consumed) => {
        if (consumed) refresh()
        if (isStravaConnected()) {
          return syncStravaActivities().then(() => refresh())
        }
      })
      .catch((e) => console.error('Strava sync failed:', e.message))

    if (shouldAutoGenerate()) {
      generateReview(getActivities(), getMorningChecks()).catch((e) =>
        console.error('Weekly review failed:', e.message),
      )
    }
  }, [refresh])

  function handleAddActivity(activity) {
    addActivity(activity)
    refresh()
    setTab('history')

    setSessionFeedback({ loading: true })
    getSessionFeedback(activity)
      .then((text) => setSessionFeedback({ text }))
      .catch((e) => setSessionFeedback({ error: e.message || 'Feedback konnte nicht erstellt werden.' }))
  }

  function handleDeleteActivity(id) {
    deleteActivity(id)
    refresh()
  }

  function handleAddMorningCheck(check) {
    addMorningCheck(check)
    refresh()
    setTab('dashboard')
  }

  function handleDeleteMorningCheck(id) {
    deleteMorningCheck(id)
    refresh()
  }

  const [title, subtitle] = TITLES[tab]

  return (
    <div className="app">
      <header className="app-header">
        <h1>{title}</h1>
        <div className="subtitle">{subtitle}</div>
      </header>

      <main className="app-main">
        {tab === 'dashboard' && (
          <Dashboard
            activities={activities}
            morningChecks={morningChecks}
            onNavigate={setTab}
          />
        )}
        {tab === 'log' && <ActivityForm onSubmit={handleAddActivity} />}
        {tab === 'morning' && <MorningCheckForm onSubmit={handleAddMorningCheck} />}
        {tab === 'history' && (
          <History
            activities={activities}
            morningChecks={morningChecks}
            onDeleteActivity={handleDeleteActivity}
            onDeleteMorningCheck={handleDeleteMorningCheck}
          />
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} />

      <SessionFeedbackOverlay state={sessionFeedback} onClose={() => setSessionFeedback(null)} />
    </div>
  )
}
