/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { TenantScopedModel } from '../../models/TenantScopedModel';

export interface SuiteTest extends TenantScopedModel {
  id: number;
  created_at: string;
  updated_at: string;
  suite_id: number;
  test_id: number;
  sequence_suite: number;
  client_id: number;
  created_by: number;
  updated_by: number;
  epoch: number;
}
