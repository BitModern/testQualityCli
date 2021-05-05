/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { KeyedModel } from '../../models/KeyedModel';

export interface Comment extends KeyedModel {
  related_id: number;
  related_type: string;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by: number;
  client_id: number;
  epoch: number;
  body?: string;
  id: number;
  key: number;
}
