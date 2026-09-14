export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { access_token } = payload
  if (!access_token) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing access_token' }) }
  }

  const listRes = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=30', {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  const list = await listRes.json()
  if (!listRes.ok) {
    return { statusCode: listRes.status, body: JSON.stringify(list) }
  }

  const weightActivity = list.find((a) => a.type === 'WeightTraining' || a.sport_type === 'WeightTraining')
  if (!weightActivity) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        error: 'Keine WeightTraining-Aktivität in den letzten 30 gefunden',
        types: list.map((a) => ({ id: a.id, name: a.name, type: a.type, sport_type: a.sport_type })),
      }),
    }
  }

  const detailRes = await fetch(`https://www.strava.com/api/v3/activities/${weightActivity.id}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  const detail = await detailRes.json()

  return { statusCode: 200, body: JSON.stringify({ listItem: weightActivity, detail }) }
}
