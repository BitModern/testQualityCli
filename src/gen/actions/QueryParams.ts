/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { CancelToken, Method } from 'axios';
import { TQRequestParameters } from './TQRequestParameters';

export interface QueryParams<T = any> {
  url?: string;
  params?: Partial<T> & TQRequestParameters;
  data?: Partial<T>;
  method?: Method;
  id?: number | string;
  cancelToken?: CancelToken;
}

export interface QueryParamsWithList<T = any> extends QueryParams<T> {
  list: Partial<T>[];
}
