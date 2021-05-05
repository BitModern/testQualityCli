/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { KeyedModel } from '../../models/KeyedModel';
import { ProjectAnalysisApi } from '../../models/ProjectAnalysisApi';

export interface Project extends KeyedModel {
  id: number;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
  epoch: number;
  /**
   * The name of the project.
   */
  name: string;
  /**
   * The description of the project.
   */
  description?: string;
  access_role_id?: number;
  client_id: number;
  /**
   * The color of the project.
   */
  color?: string;
  /**
   * The picture used to represent the project.
   */
  picture?: string;
  virtual?: any;
  key: number;
  analysis?: ProjectAnalysisApi;
}
