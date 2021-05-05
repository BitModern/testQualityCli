/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { KeyedModel } from '../../models/KeyedModel';

export interface Milestone extends KeyedModel {
  /**
   * Specifies the order of milestones within a project.
   */
  sequence: number;
  /**
   * Allows for user extensability.
   */
  virtual?: any;
  /**
   * The milestone is complete.
   */
  is_complete: boolean;
  key: number;
  deleted_at?: string;
  total_test_cases: number;
  id: number;
  /**
   * The user that created the milestone.
   */
  created_by: number;
  /**
   * The time the milestone was created.
   */
  created_at: string;
  /**
   * The user that last modified the milestone.
   */
  updated_by: number;
  /**
   * The time the milestone was last modified.
   */
  updated_at: string;
  /**
   * Used to gaurd against blind updates.
   */
  epoch: number;
  /**
   * The name of the milestone.
   */
  name: string;
  /**
   * The description of the milestone.
   */
  description?: string;
  /**
   * The client that owns the milestone.
   */
  client_id: number;
  project_id: number;
  /**
   * The time the milestone was started.
   */
  start_date?: string;
  /**
   * The time the milestone will be released.
   */
  release_date?: string;
}
