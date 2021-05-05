/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { Status } from './Status';
import { LabelAssignedApi } from '../label_assigned/LabelAssignedApi';
import { RunResultStepApi } from '../run_result_step/RunResultStepApi';
import { RunResultApi } from '../run_result/RunResultApi';

export interface StatusApi extends Status {
  label_assigned?: LabelAssignedApi;
  run_result_step?: RunResultStepApi[];
  run_result?: RunResultApi[];
}
