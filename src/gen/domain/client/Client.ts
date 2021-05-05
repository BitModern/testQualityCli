/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { DefaultAttributes } from '../../models/DefaultAttributes';

export interface Client extends DefaultAttributes {
  id: number;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
  epoch: number;
  /**
   * The name of the client.
   */
  name: string;
  /**
   * The name of the database which contains the tables and data for this client. Although we have shared table multi-tenant support 1 or more clients can be stored in an indivdual database.
   */
  database_name?: string;
  company_name?: string;
  company_url?: string;
  company_email?: string;
  company_phone?: string;
  total_run_rows: number;
  total_run_result_rows: number;
  total_run_result_step_rows: number;
  /**
   * The space allowed for this client. The default value is 0 which signifies the system default should be used to calculate the space allowed. If a value is present the value is used as the max space allowed.
   */
  space_limit_per_user: number;
  /**
   * The used space in kB
   */
  space_used: number;
  /**
   * The free space in kB
   */
  space_free: number;
  has_automatic_signup: boolean;
  domain_restriction?: string;
}
