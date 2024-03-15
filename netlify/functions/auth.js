import oauth2, { config } from './utils/oauth'

/* Do initial auth redirect */
export default  (event, context, callback) => {
  /* Generate authorizationURI */
  const authorizationURI = oauth2.authorizationCode.authorizeURL({
    redirect_uri: config.redirect_uri,
    /* Specify how your app needs to access the user’s account. http://bit.ly/intercom-scopes */
    scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
    /* State helps mitigate CSRF attacks & Restore the previous state of your app */
  })
  const blob = new Blob();


  /* Redirect user to authorizationURI */
  const options =  {
    status: 302,
    headers: {
      Location: authorizationURI,
      'Cache-Control': 'no-cache' // Disable caching of this response
    },
    body: null // return body for local dev
  }
  return new Response(blob, options);

}
