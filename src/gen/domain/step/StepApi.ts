/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { Step } from './Step';
import { TestApi } from '../test/TestApi';
import { ProjectApi } from '../project/ProjectApi';
import { LabelAssignedApi } from '../label_assigned/LabelAssignedApi';
import { RunResultStepApi } from '../run_result_step/RunResultStepApi';
import { CommentApi } from '../comment/CommentApi';

export interface StepApi extends Step {
  test?: TestApi;
  project?: ProjectApi;
  label_assigned?: LabelAssignedApi;
  run_result_step?: RunResultStepApi[];
  comment?: CommentApi;
}
