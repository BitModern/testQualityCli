/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { Plan } from './Plan';
import { ProjectApi } from '../project/ProjectApi';
import { LabelAssignedApi } from '../label_assigned/LabelAssignedApi';
import { PlanSuiteApi } from '../plan_suite/PlanSuiteApi';
import { SuiteApi } from '../suite/SuiteApi';
import { RunApi } from '../run/RunApi';
import { PlanPurposeApi } from '../plan_purpose/PlanPurposeApi';
import { PurposeApi } from '../purpose/PurposeApi';
import { CommentApi } from '../comment/CommentApi';
import { AttachmentApi } from '../attachment/AttachmentApi';
import { PlanSuiteTestIncludeApi } from '../plan_suite_test_include/PlanSuiteTestIncludeApi';

export interface PlanApi extends Plan {
  project?: ProjectApi;
  label_assigned?: LabelAssignedApi;
  suite?: SuiteApi[];
  run?: RunApi[];
  purpose?: PurposeApi[];
  purpose_id?: number;
  comment?: CommentApi;
  attachment?: AttachmentApi;
  plan_suite_test_include?: PlanSuiteTestIncludeApi[];
  pivot?: PlanSuiteApi | PlanPurposeApi;
}
