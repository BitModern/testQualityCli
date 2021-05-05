/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { Run } from './Run';
import { ProjectApi } from '../project/ProjectApi';
import { PlanApi } from '../plan/PlanApi';
import { MilestoneApi } from '../milestone/MilestoneApi';
import { LabelAssignedApi } from '../label_assigned/LabelAssignedApi';
import { RunResultApi } from '../run_result/RunResultApi';
import { CommentApi } from '../comment/CommentApi';

export interface RunApi extends Run {
  project?: ProjectApi;
  plan?: PlanApi;
  milestone?: MilestoneApi;
  label_assigned?: LabelAssignedApi;
  run_result?: RunResultApi[];
  comment?: CommentApi;
}
