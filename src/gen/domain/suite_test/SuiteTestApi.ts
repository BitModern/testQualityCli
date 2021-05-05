/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* eslint-disable import/no-cycle */

import { SuiteTest } from './SuiteTest';
import { SuiteApi } from '../suite/SuiteApi';
import { TestApi } from '../test/TestApi';

export interface SuiteTestApi extends SuiteTest {
  suite?: SuiteApi;
  test?: TestApi;
}
