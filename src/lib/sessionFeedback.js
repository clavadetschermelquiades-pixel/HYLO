export async function getSessionFeedback(activity) {
  const res = await fetch('/.netlify/functions/session-feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activity }),
  })
  if (!res.ok) throw new Error('Feedback konnte nicht erstellt werden.')
  const data = await res.json()
  return data.feedback
}
