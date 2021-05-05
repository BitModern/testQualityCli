/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { KeyedModel } from '../../models/KeyedModel';
import { RunAnalysisApi } from '../../models/RunAnalysisApi';

export interface Run extends KeyedModel {
  id: number;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
  epoch: number;
  client_id: number;
  /**
   * The time when the testing for this test run began.
   */
  start_time?: string;
  /**
   * The time when the testing for this test run concluded.
   */
  end_time?: string;
  /**
   * If set this test is complete and cannot be modified or deleted.
   */
  is_complete: boolean;
  /**
   * If set this test is being tested.
   */
  is_running: boolean;
  project_id: number;
  plan_id: number;
  virtual?: any;
  /**
   * The user can supply a name to make identification of a particular test run easier. If the user does not supply a name then the
   * system will generate a name consisting of the plan name followed by the date and time.
   */
  name: string;
  key: number;
  milestone_id?: number;
  /**
   * Specifies this run is the most current complete run to use for analysis.
   */
  is_current: boolean;
  host_name?: string;
  run_result_rows: number;
  run_result_step_rows: number;
  is_permanent?: boolean;
  analysis?: RunAnalysisApi;
}
