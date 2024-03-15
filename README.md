# Netlify + Google OAuth &nbsp;&nbsp;&nbsp;<a href="https://app.netlify.com/start/deploy?repository=https://github.com/davidwells/intercom-netlify-oauth"><img src="https://www.netlify.com/img/deploy/button.svg"></a>

Add 'login with Google' via Netlify Functions & OAuth!

<!-- AUTO-GENERATED-CONTENT:START (TOC) -->
- [About the project](#about-the-project)
- [How to install and setup](#how-to-install-and-setup)
- [Running the project locally](#running-the-project-locally)
- [Deploying](#deploying)
- [How it works with Netlify Functions](#how-it-works-with-netlify-functions)
  * [auth.js function](#authjs-function)
  * [auth-callback.js function](#auth-callbackjs-function)
<!-- AUTO-GENERATED-CONTENT:END -->

## About the project

This project sets up a "login with Google" OAuth flow using netlify functions.
The original code base allowed login with Intercom , its been adapted to login with google . Also I removed react.



You can leverage this project to wire up google (or other OAuth providers) login with your application, although its best to use a library like Auth.js to login , instead of doing the OAuth dance yourself.

Also note , the server should ideally set the id_token and access_token as http only secure cookies and use that to restrict access to secure endpoings and also set bearer when calling Google apis. This hasn't been done in the project.

---

Let's get started with how to get setup with the repo and with Intercom.

## How to install and setup

1. **Clone down the repository**

    ```bash
    git clone git@github.com:rachitpant/intercom-netlify-oauth.git
    ```

2. **Install the dependencies**

    ```bash
    npm install
    ```

3. **Create an Google cloud app and get the OAuth credentials**

    Once you are done , copy the .env.example file to .env and update with your credentials.



## Running the project locally


Then run the start command

```bash
npm run dev
```

This will boot up our functions to run locally for development. You can now login via your Google application and see the token data returned.

Making edits to the functions in the `/functions` will hot reload the server and you can iterate on building your custom logic.

## Deploying

Use the one click "deploy to Netlify" button to launch this!

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/rachitpant/intercom-netlify-oauth)

After your site is deployed, you should be able to test your Intercom login flow.

## How it works with Netlify Functions

Once again, serverless functions come to the rescue!

We will be using 2 functions to handle the entire OAuth flow with Intercom.

**Here is a diagram of what is happening:**

![Intercom oauth netlify](https://user-images.githubusercontent.com/532272/42144429-d2717f24-7d6f-11e8-8619-c1bec1562991.png)

1. First the `auth.js` function is triggered & redirects the user to Intercom
2. The user logs in via Intercom and is redirected back to `auth-callback.js` function with an **auth grant code**
3. `auth-callback.js` takes the **auth grant code** and calls back into Intercom's API to exchange it for an **AccessToken**
4. `auth-callback.js` now has the **AccessToken** to make any API calls it would like back into the Intercom App.

This flow uses the [Authorization Code Grant](https://tools.ietf.org/html/draft-ietf-oauth-v2-31#section-4.1) flow. For more information on OAuth 2.0, [Watch this video](https://www.youtube.com/watch?v=CPbvxxslDTU)

Let's dive into the individual functions and how they work.

### auth.js function

The `auth.js` function creates an `authorizationURI` using the [`simple-oauth2` npm module](https://www.npmjs.com/package/simple-oauth2) and redirects the user to the Intercom login screen.

Inside of the `auth.js` function, we set the `header.Location` in the lambda response and that will redirect the user to the `authorizationURI`, a.k.a the Intercom oauth login screen.

<!-- AUTO-GENERATED-CONTENT:START (CODE:src=./functions/auth.js&header=/* code from /functions/auth.js */) -->
<!-- The below code snippet is automatically added from ./functions/auth.js -->
```js
/* code from /functions/auth.js */
import oauth2, { config } from './utils/oauth'

/* Do initial auth redirect */
exports.handler = (event, context, callback) => {
  /* Generate authorizationURI */
  const authorizationURI = oauth2.authorizationCode.authorizeURL({
    redirect_uri: config.redirect_uri,
    /* Specify how your app needs to access the user’s account. http://bit.ly/intercom-scopes */
    scope: '',
    /* State helps mitigate CSRF attacks & Restore the previous state of your app */
    state: '',
  })

  /* Redirect user to authorizationURI */
  const response = {
    statusCode: 302,
    headers: {
      Location: authorizationURI,
      'Cache-Control': 'no-cache' // Disable caching of this response
    },
    body: '' // return body for local dev
  }

  return callback(null, response)
}
```
<!-- AUTO-GENERATED-CONTENT:END -->

### auth-callback.js function

The `auth-callback.js` function handles the authorization grant code returned from the successful Intercom login.

It then calls `oauth2.authorizationCode.getToken` to get a valid `accessToken` from Intercom.

Once you have the valid accessToken, you can store it and make authenticated calls on behalf of the user to the Google API.

<!-- AUTO-GENERATED-CONTENT:START (CODE:src=./functions/auth-callback.js&header=/* code from /functions/auth-callback.js */) -->
<!-- The below code snippet is automatically added from ./functions/auth-callback.js -->
```js
/* code from /functions/auth-callback.js */
import getUserData from './utils/getUserData'
import oauth2, { config } from './utils/oauth'

/* Function to handle intercom auth callback */
exports.handler = (event, context, callback) => {
  const code = event.queryStringParameters.code
  /* state helps mitigate CSRF attacks & Restore the previous state of your app */
  const state = event.queryStringParameters.state

  /* Take the grant code and exchange for an accessToken */
  oauth2.authorizationCode.getToken({
    code: code,
    redirect_uri: config.redirect_uri,
    client_id: config.clientId,
    client_secret: config.clientSecret
  })
    .then((result) => {
      const token = oauth2.accessToken.create(result)
      console.log('accessToken', token)
      return token
    })
    // Get more info about intercom user
    .then(getUserData)
    // Do stuff with user data & token
    .then((result) => {
      console.log('auth token', result.token)
      // Do stuff with user data
      console.log('user data', result.data)
      // Do other custom stuff
      console.log('state', state)
      // return results to browser
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify(result)
      })
    })
    .catch((error) => {
      console.log('Access Token Error', error.message)
      console.log(error)
      return callback(null, {
        statusCode: error.statusCode || 500,
        body: JSON.stringify({
          error: error.message,
        })
      })
    })
}
```
<!-- AUTO-GENERATED-CONTENT:END -->

Using two simple lambda functions, we can now handle logins via Intercom or any other third party OAuth provider.

That's pretty nifty!
