/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { KeyedModel } from '../../models/KeyedModel';

export interface RunResultStep extends KeyedModel {
  run_result_id: number;
  step_id: number;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
  epoch: number;
  /**
   * The version of the software this run_result_step was tested against.
   */
  version?: string;
  /**
   * The amoun tof time this run_result_step has been tested.
   */
  elapsed?: number;
  /**
   * The status of the step.
   */
  status_id: number;
  id: number;
  client_id: number;
  project_id: number;
  /**
   * The order of steps withing a test.
   */
  sequence: number;
  virtual?: any;
  /**
   * The result of testing the step.
   */
  result?: string;
  key: number;
}
