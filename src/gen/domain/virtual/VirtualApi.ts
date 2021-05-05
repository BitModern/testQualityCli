/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { Virtual } from './Virtual';
import { ClientApi } from '../client/ClientApi';

export interface VirtualApi extends Virtual {
  client?: ClientApi;
}
