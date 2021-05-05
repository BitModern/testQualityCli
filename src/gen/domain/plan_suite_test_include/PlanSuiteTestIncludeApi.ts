/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { PlanSuiteTestInclude } from './PlanSuiteTestInclude';
import { PlanApi } from '../plan/PlanApi';
import { SuiteApi } from '../suite/SuiteApi';
import { TestApi } from '../test/TestApi';
import { ProjectApi } from '../project/ProjectApi';

export interface PlanSuiteTestIncludeApi extends PlanSuiteTestInclude {
  plan?: PlanApi;
  suite?: SuiteApi;
  test?: TestApi;
  project?: ProjectApi;
}
