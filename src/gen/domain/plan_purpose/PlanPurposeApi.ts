/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { PlanPurpose } from './PlanPurpose';
import { PurposeApi } from '../purpose/PurposeApi';
import { PlanApi } from '../plan/PlanApi';

export interface PlanPurposeApi extends PlanPurpose {
  purpose?: PurposeApi;
  plan?: PlanApi;
}
