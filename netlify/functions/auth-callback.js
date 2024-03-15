import getUserData from './utils/getUserData'
import oauth2, {config} from './utils/oauth'

/* Function to handle intercom auth callback */
export default async (event, context) => {
  try {
    const code = new URL(event.url).searchParams.get("code")
    const state = new URL(event.url).searchParams.get("state")

    /* Take the grant code and exchange for an accessToken */
    const token = await oauth2.authorizationCode.getToken({
      code: code,
      redirect_uri: config.redirect_uri,
      client_id: config.clientId,
      client_secret: config.clientSecret
    });

    // Get more info about the user
    const userData = await getUserData(token);

    // Do stuff with user data & token

    const blob = new Blob([userData], { type: 'application/json' });

    /* Redirect user to authorizationURI */
    const options = {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache', // Disable caching of this response
        'Content-Type': 'application/json'
      },
      body: blob
    };

    return new Response(blob, options);
  } catch (error) {
    console.log('Access Token Error', error.message);
    console.log(error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        error: error.message,
      })
    };
  }
};