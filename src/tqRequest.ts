import { env } from './env';
import * as request from 'request-promise-native';

const getHeaders = (accessToken: string) => {
  return {
    'content-type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json'
  };
};

export function tqRequest<R>(
  accessToken: string,
  path: string,
  method: string = 'GET',
  formData?: any
): Promise<R> {
  return new Promise((resolve, reject) => {
    const url = `${env.host}${path}`;
    const options = {
      method,
      url,
      headers: getHeaders(accessToken),
      formData,
      json: true // Automatically parses the JSON string in the response
    };
    return request(options).then(resolve, reject);
  });
}

export function tqPost<R>(
  accessToken: string,
  path: string,
  formData?: any
): Promise<R> {
  return tqRequest<R>(accessToken, path, 'POST', formData);
}
