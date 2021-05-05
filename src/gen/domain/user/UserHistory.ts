/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { User } from './User';

export interface UserHistory extends User {
  _id: string;
  operation: 'create' | 'delete' | 'update';
}
