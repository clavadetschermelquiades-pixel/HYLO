function buildPrompt(activities, morningChecks) {
  return `Du bist ein Trainings-Coach. Fasse die folgende Trainingswoche auf Deutsch kurz und konkret zusammen (max. 150 Wörter, Fliesstext ohne Überschriften). Gehe ein auf:
- Trainingsvolumen Lauf (Anzahl Läufe, Gesamtkilometer, Gesamtzeit)
- Trainingsvolumen Kraft (Anzahl Sessions, Gesamtdauer, wichtigste Übungen)
- Trends bei Ruhepuls, Schlaf und Gewicht (steigend/fallend/stabil, basierend auf den Morgencheck-Werten)
- ein kurzes, motivierendes Fazit

Falls zu einem Punkt keine Daten vorhanden sind, erwähne das kurz und überspringe ihn sonst.

Aktivitäten der letzten 7 Tage (JSON):
${JSON.stringify(activities)}

Morgenchecks der letzten 7 Tage (JSON):
${JSON.stringify(morningChecks)}`
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }) }
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { activities = [], morningChecks = [] } = payload

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: buildPrompt(activities, morningChecks) }],
    }),
  })

  const data = await anthropicRes.json()

  if (!anthropicRes.ok) {
    return { statusCode: anthropicRes.status, body: JSON.stringify(data) }
  }

  const summary = data.content?.[0]?.text?.trim() || ''
  return { statusCode: 200, body: JSON.stringify({ summary }) }
}
