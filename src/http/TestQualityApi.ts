/**
 * Copyright (C) 2020 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Created by jamespitts on 1/23/20.
 */
import { env } from '../env';
import axios from 'axios';

export const testQualityApi = axios.create({
  baseURL: env.api.url + '/api',
  timeout: 100000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});
