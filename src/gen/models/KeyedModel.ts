/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { TenantScopedModel } from './TenantScopedModel';

export interface KeyedModel extends TenantScopedModel {
  key: number;
}
