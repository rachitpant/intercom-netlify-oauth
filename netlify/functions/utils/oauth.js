import simpleOauth from 'simple-oauth2'

/* process.env.URL from netlify BUILD environment variables */
const siteUrl = process.env.URL || 'http://localhost:3000'

export const config = {
  /* values set in terminal session or in netlify environment variables */
  appId: process.env.APP_ID,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  /* Intercom oauth API endpoints */
  tokenHost: process.env.TOKEN_HOST,
  tokenPath: process.env.TOKEN_PATH,
  authorizePath: process.env.AUTHORIZE_PATH,
  profilePath: process.env.PROFILE_PATH,
  /* redirect_uri is the callback url after successful signin */
  redirect_uri: `${siteUrl}/.netlify/functions/auth-callback`,
}

function authInstance(credentials) {
  if (!credentials.client.id) {
    throw new Error('MISSING REQUIRED ENV VARS. Please set CLIENT_ID')
  }
  if (!credentials.client.secret) {
    throw new Error('MISSING REQUIRED ENV VARS. Please set CLIENT_SECRET')
  }
  // return oauth instance
  return simpleOauth.create(credentials)
}

/* Create oauth2 instance to use in our two functions */
export default authInstance({
  client: {
    id: config.clientId,
    secret: config.clientSecret
  },
  auth: {
    tokenHost: config.tokenHost,
    authorizePath: config.authorizePath,
    tokenPath: config.tokenPath
  }
})
