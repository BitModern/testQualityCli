/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { LabelAssigned } from './LabelAssigned';

export interface LabelAssignedHistory extends LabelAssigned {
  _id: string;
  operation: 'create' | 'delete' | 'update';
}
