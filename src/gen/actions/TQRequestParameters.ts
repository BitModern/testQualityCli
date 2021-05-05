/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

export interface TQRequestParameters {
  _sort?: string;
  _with?: string;
  per_page?: number;
  page?: number;
  revision_log?: boolean;
}
