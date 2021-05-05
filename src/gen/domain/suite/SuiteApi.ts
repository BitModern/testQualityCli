/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { Suite } from './Suite';
import { ProjectApi } from '../project/ProjectApi';
import { LabelAssignedApi } from '../label_assigned/LabelAssignedApi';
import { SuiteTestApi } from '../suite_test/SuiteTestApi';
import { TestApi } from '../test/TestApi';
import { PlanSuiteApi } from '../plan_suite/PlanSuiteApi';
import { PlanApi } from '../plan/PlanApi';
import { RunResultApi } from '../run_result/RunResultApi';
import { CommentApi } from '../comment/CommentApi';
import { PlanSuiteTestIncludeApi } from '../plan_suite_test_include/PlanSuiteTestIncludeApi';

export interface SuiteApi extends Suite {
  project?: ProjectApi;
  label_assigned?: LabelAssignedApi;
  test?: TestApi[];
  plan?: PlanApi[];
  plan_id?: number; // This field is required during create
  sequence_plan?: number;
  run_result?: RunResultApi[];
  comment?: CommentApi;
  plan_suite_test_include?: PlanSuiteTestIncludeApi[];
  pivot?: SuiteTestApi | PlanSuiteApi;
}
