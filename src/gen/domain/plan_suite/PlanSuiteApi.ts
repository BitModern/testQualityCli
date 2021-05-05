/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { PlanSuite } from './PlanSuite';
import { PlanApi } from '../plan/PlanApi';
import { SuiteApi } from '../suite/SuiteApi';

export interface PlanSuiteApi extends PlanSuite {
  plan?: PlanApi;
  suite?: SuiteApi;
}
