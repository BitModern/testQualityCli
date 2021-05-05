/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { KeyedModel } from '../../models/KeyedModel';

export interface User extends KeyedModel {
  id: number;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
  epoch: number;
  given_name?: string;
  family_name?: string;
  email: string;
  picture?: string;
  client_id: number;
  remember_token?: string;
  password: string;
  settings?: any;
  color?: string;
  key: number;
  last_login?: string;
  stripe_id?: string;
  card_brand?: string;
  card_last_four?: string;
  trial_ends_at?: string;
  verified: boolean;
  verification_token?: string;
  /**
   * If set this user is a system user with god permission.
   */
  is_system?: boolean;
  version_id: number;
  old_password?: string;
  is_expired: boolean;
}
