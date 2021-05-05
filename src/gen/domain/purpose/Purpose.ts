/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { KeyedModel } from '../../models/KeyedModel';

export interface Purpose extends KeyedModel {
  id: number;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
  epoch: number;
  /**
   * The name of the purpose.
   */
  name: string;
  /**
   * The definiiton of the purpose.
   */
  description?: string;
  /**
   * Is this row a system row? A system row cannot be modified or deleted.
   */
  is_system?: boolean;
  client_id: number;
  /**
   * If set this case_type will be assigned to a newly created test.
   */
  is_default: boolean;
  virtual?: any;
  key: number;
  weight?: number;
}
