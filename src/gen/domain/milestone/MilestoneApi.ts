/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { Milestone } from './Milestone';
import { ProjectApi } from '../project/ProjectApi';
import { LabelAssignedApi } from '../label_assigned/LabelAssignedApi';
import { CommentApi } from '../comment/CommentApi';
import { RunApi } from '../run/RunApi';

export interface MilestoneApi extends Milestone {
  project?: ProjectApi;
  label_assigned?: LabelAssignedApi;
  comment?: CommentApi;
  run?: RunApi[];
}
