import request from 'request'
import querystring from 'querystring'
import { config } from './oauth'

/* Call into https://app.intercom.io/me and return user data */
export default function getUserData(token) {
  // Construct the request options
  const requestOptions = {
    url: config.profilePath,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      'Content-Type': 'application/json'
    }
  };

  // Make a request using the request wrapper
  return requestWrapper(requestOptions, token)
      .then(response => {
        // Resolve with the response data
        return response.data;
      })
      .catch(error => {
        // Handle error
        console.error('Error fetching user data:', error);
        throw error; // Rethrow error for further handling
      });
}


/* promisify request call */
function requestWrapper(requestOptions, token) {
  return new Promise((resolve, reject) => {
    request(requestOptions, (err, response, body) => {
      if (err) {
        return reject(err)
      }
      // return data
      return resolve({
        token: token,
        data: body,
      })
    })
  })
}
