const STRAVA_CLIENT_ID = '278804'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  if (!clientSecret) {
    return { statusCode: 500, body: JSON.stringify({ error: 'STRAVA_CLIENT_SECRET not configured' }) }
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    client_secret: clientSecret,
  })

  if (payload.code) {
    params.set('code', payload.code)
    params.set('grant_type', 'authorization_code')
  } else if (payload.refresh_token) {
    params.set('refresh_token', payload.refresh_token)
    params.set('grant_type', 'refresh_token')
  } else {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing code or refresh_token' }) }
  }

  const stravaRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })

  const data = await stravaRes.json()

  if (!stravaRes.ok) {
    return { statusCode: stravaRes.status, body: JSON.stringify(data) }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      athlete: data.athlete
        ? { id: data.athlete.id, firstname: data.athlete.firstname, lastname: data.athlete.lastname }
        : undefined,
    }),
  }
}
