/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { KeyedModel } from '../../models/KeyedModel';

export interface Step extends KeyedModel {
  id: number;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
  epoch: number;
  test_id: number;
  /**
   * A step is a finite portion of a test specifying what needs to be tested. A step has an expected result.
   * A test is made of one or more tests.
   */
  step?: string;
  /**
   * The expected result for this step after testing it.
   */
  expected_result?: string;
  virtual?: any;
  client_id: number;
  project_id: number;
  /**
   * specifies the order of steps within a test
   */
  sequence: number;
  key: number;
}
