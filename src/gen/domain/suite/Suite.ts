/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { KeyedModel } from '../../models/KeyedModel';

export interface Suite extends KeyedModel {
  id: number;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
  epoch: number;
  /**
   * The name of the suite.
   */
  name: string;
  /**
   * The description of the suite.
   */
  description?: string;
  project_id: number;
  virtual?: any;
  client_id: number;
  /**
   * The id of the user this suite is assigned to.
   */
  assigned_to_tester?: number;
  key: number;
  is_root?: boolean;
}
