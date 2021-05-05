/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { CaseType } from './CaseType';

export interface CaseTypeHistory extends CaseType {
  _id: string;
  operation: 'create' | 'delete' | 'update';
}
