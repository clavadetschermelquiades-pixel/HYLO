import { useEffect, useState, useCallback } from 'react'
import BottomNav from './components/BottomNav.jsx'
import Dashboard from './components/Dashboard.jsx'
import ActivityForm from './components/ActivityForm.jsx'
import MorningCheckForm from './components/MorningCheckForm.jsx'
import History from './components/History.jsx'
import {
  getActivities,
  addActivity,
  deleteActivity,
  getMorningChecks,
  addMorningCheck,
  deleteMorningCheck,
} from './lib/storage.js'
import { formatDate, todayStr } from './lib/utils.js'
import { handleStravaRedirect } from './lib/strava.js'

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
  const [stravaError, setStravaError] = useState('')

  const refresh = useCallback(() => {
    setActivities(getActivities())
    setMorningChecks(getMorningChecks())
  }, [])

  useEffect(() => {
    refresh()
    handleStravaRedirect()
      .then((consumed) => {
        if (consumed) refresh()
      })
      .catch((e) => setStravaError(e.message))
  }, [refresh])

  function handleAddActivity(activity) {
    addActivity(activity)
    refresh()
    setTab('history')
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
            onDataChanged={refresh}
            stravaError={stravaError}
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
    </div>
  )
}
