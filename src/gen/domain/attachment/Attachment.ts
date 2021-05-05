/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { KeyedModel } from '../../models/KeyedModel';

export interface Attachment extends KeyedModel {
  related_id: number;
  related_type: string;
  /**
   * The URL to the file. This URL will typically be in cloud storage.
   * hoverhelp
   */
  url?: string;
  created_at: string;
  created_by: number;
  updated_at: string;
  updated_by: number;
  client_id: number;
  epoch: number;
  id: number;
  attachment_type_id: number;
  key: number;
  original_file_name: string;
  size?: bigint;
}
