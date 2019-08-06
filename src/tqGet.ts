import { env } from './env';
import * as request from 'request-promise-native';

export function tqGet<R>(accessToken: string, path: string): Promise<R> {
  return new Promise((resolve, reject) => {
    const url = `${env.host}${path}`;
    const options = {
      method: 'GET',
      url,
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      },
      json: true // Automatically parses the JSON string in the response
    };
    return request(options).then(resolve, reject);
  });
}
