/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { Project } from './Project';
import { LabelAssignedApi } from '../label_assigned/LabelAssignedApi';
import { PlanApi } from '../plan/PlanApi';
import { SuiteApi } from '../suite/SuiteApi';
import { TestApi } from '../test/TestApi';
import { MilestoneApi } from '../milestone/MilestoneApi';
import { StepApi } from '../step/StepApi';
import { RunResultApi } from '../run_result/RunResultApi';
import { RunResultStepApi } from '../run_result_step/RunResultStepApi';
import { RunApi } from '../run/RunApi';
import { CommentApi } from '../comment/CommentApi';
import { AttachmentApi } from '../attachment/AttachmentApi';
import { PlanSuiteTestIncludeApi } from '../plan_suite_test_include/PlanSuiteTestIncludeApi';

export interface ProjectApi extends Project {
  label_assigned?: LabelAssignedApi;
  plan?: PlanApi[];
  suite?: SuiteApi[];
  test?: TestApi[];
  milestone?: MilestoneApi[];
  step?: StepApi[];
  run_result?: RunResultApi[];
  run_result_step?: RunResultStepApi[];
  run?: RunApi[];
  comment?: CommentApi;
  attachment?: AttachmentApi;
  plan_suite_test_include?: PlanSuiteTestIncludeApi[];
}
