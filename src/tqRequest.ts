import { testQualityApi } from './http/TestQualityApi';
import { Method } from 'axios';

const api = testQualityApi;

export function tqRequest<T>(
  path: string,
  method: Method = 'GET',
  formData?: any,
  headers?: any
): Promise<T> {
  return api
    .request<T>({
      method,
      url: path,
      data: formData,
      headers,
    })
    .then((resp) => {
      if (resp && resp.data) {
        return resp.data;
      }
      throw new Error('No response was provided');
    });
}

export function tqPost<T>(path: string, formData?: any): Promise<T> {
  return tqRequest<T>(path, 'POST', formData);
}
