/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { Test } from './Test';
import { CaseTypeApi } from '../case_type/CaseTypeApi';
import { CasePriorityApi } from '../case_priority/CasePriorityApi';
import { ProjectApi } from '../project/ProjectApi';
import { LabelAssignedApi } from '../label_assigned/LabelAssignedApi';
import { SuiteTestApi } from '../suite_test/SuiteTestApi';
import { SuiteApi } from '../suite/SuiteApi';
import { RunResultApi } from '../run_result/RunResultApi';
import { StepApi } from '../step/StepApi';
import { AttachmentApi } from '../attachment/AttachmentApi';
import { CommentApi } from '../comment/CommentApi';
import { PlanSuiteTestIncludeApi } from '../plan_suite_test_include/PlanSuiteTestIncludeApi';

export interface TestApi extends Test {
  case_type?: CaseTypeApi;
  case_priority?: CasePriorityApi;
  project?: ProjectApi;
  label_assigned?: LabelAssignedApi;
  suite?: SuiteApi[];
  suite_id?: number; // This field is required during create
  sequence_suite?: number;
  run_result?: RunResultApi[];
  step?: StepApi[];
  attachment?: AttachmentApi;
  comment?: CommentApi;
  plan_suite_test_include?: PlanSuiteTestIncludeApi[];
  pivot?: SuiteTestApi;
}
