/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
import { DefaultAttributes } from './DefaultAttributes';

export interface TenantScopedModel extends DefaultAttributes {
  client_id: number;
}
