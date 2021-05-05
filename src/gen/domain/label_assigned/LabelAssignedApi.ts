/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { LabelAssigned } from './LabelAssigned';
import { LabelApi } from '../label/LabelApi';
import { MilestoneApi } from '../milestone/MilestoneApi';
import { RunApi } from '../run/RunApi';
import { PurposeApi } from '../purpose/PurposeApi';
import { SuiteApi } from '../suite/SuiteApi';
import { TestApi } from '../test/TestApi';
import { ProjectApi } from '../project/ProjectApi';
import { CaseTypeApi } from '../case_type/CaseTypeApi';
import { CasePriorityApi } from '../case_priority/CasePriorityApi';
import { PlanApi } from '../plan/PlanApi';
import { RunResultApi } from '../run_result/RunResultApi';
import { StepApi } from '../step/StepApi';
import { RunResultStepApi } from '../run_result_step/RunResultStepApi';
import { StatusApi } from '../status/StatusApi';

export interface LabelAssignedApi extends LabelAssigned {
  label?: LabelApi;
  milestone?: MilestoneApi;
  run?: RunApi;
  purpose?: PurposeApi;
  suite?: SuiteApi;
  test?: TestApi;
  project?: ProjectApi;
  case_type?: CaseTypeApi;
  case_priority?: CasePriorityApi;
  plan?: PlanApi;
  run_result?: RunResultApi;
  step?: StepApi;
  run_result_step?: RunResultStepApi;
  status?: StatusApi;
}
