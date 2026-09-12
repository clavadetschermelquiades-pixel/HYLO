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

  const { access_token, after } = payload
  if (!access_token) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing access_token' }) }
  }

  const url = new URL('https://www.strava.com/api/v3/athlete/activities')
  url.searchParams.set('per_page', '100')
  if (after) url.searchParams.set('after', String(after))

  const stravaRes = await fetch(url, {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  const data = await stravaRes.json()

  if (!stravaRes.ok) {
    return { statusCode: stravaRes.status, body: JSON.stringify(data) }
  }

  const activities = data.map((a) => ({
    stravaId: a.id,
    name: a.name,
    type: a.type,
    sportType: a.sport_type,
    startDateLocal: a.start_date_local,
    distanceMeters: a.distance,
    movingTimeSeconds: a.moving_time,
  }))

  return { statusCode: 200, body: JSON.stringify(activities) }
}
