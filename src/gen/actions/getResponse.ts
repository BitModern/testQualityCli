/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { AxiosInstance } from 'axios';
import { QueryParams } from './QueryParams';

export function getResponse<T, Q = T>(
  api: AxiosInstance,
  queryParams: QueryParams<Q>
): Promise<T> {
  return api
    .request<T>({
      method: queryParams.method,
      url: queryParams.url,
      params: queryParams.params,
      data: queryParams.data,
    })
    .then((resp) => {
      if (resp && resp.data) {
        return resp.data;
      }
      throw new Error('No response was provided');
    });
}
