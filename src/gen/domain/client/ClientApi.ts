/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { Client } from './Client';
import { VirtualApi } from '../virtual/VirtualApi';

export interface ClientApi extends Client {
  virtual?: VirtualApi[];
}
