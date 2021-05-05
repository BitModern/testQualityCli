/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { KeyedModel } from '../../models/KeyedModel';

export interface PlanSuiteTestInclude extends KeyedModel {
  id: number;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
  epoch: number;
  client_id: number;
  plan_id: number;
  suite_id: number;
  test_id: number;
  project_id: number;
}
