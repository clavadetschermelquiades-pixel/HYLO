function stripMarkdown(text) {
  return text
    .replace(/^#{1,6}\s*.*$/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function buildPrompt(activity) {
  return `Du bist ein Trainings-Coach. Der Nutzer hat gerade folgende Trainingseinheit abgeschlossen (JSON):
${JSON.stringify(activity)}

Gib eine kurze Rückmeldung dazu (1-2 Sätze) und danach eine konkrete, kurze Erholungsempfehlung passend zu Art, Dauer und Intensität der Einheit (z. B. Wasser, Elektrolyte, Magnesium, Dehnen/Mobility, Eiweiss, Schlaf – wähle was am besten passt, nicht alles auflisten).

Antworte auf Deutsch, maximal 60 Wörter, reiner Fliesstext ohne Markdown, keine Überschriften, keine Aufzählungspunkte.`
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

  const { activity } = payload
  if (!activity) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing activity' }) }
  }

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: buildPrompt(activity) }],
    }),
  })

  const data = await anthropicRes.json()

  if (!anthropicRes.ok) {
    return { statusCode: anthropicRes.status, body: JSON.stringify(data) }
  }

  const feedback = stripMarkdown(data.content?.[0]?.text || '')
  return { statusCode: 200, body: JSON.stringify({ feedback }) }
}
