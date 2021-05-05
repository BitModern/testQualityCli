/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { Purpose } from './Purpose';
import { LabelAssignedApi } from '../label_assigned/LabelAssignedApi';
import { PlanPurposeApi } from '../plan_purpose/PlanPurposeApi';
import { PlanApi } from '../plan/PlanApi';

export interface PurposeApi extends Purpose {
  label_assigned?: LabelAssignedApi;
  plan?: PlanApi[];
  pivot?: PlanPurposeApi;
}
