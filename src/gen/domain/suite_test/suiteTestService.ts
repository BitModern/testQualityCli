/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { tqApi } from 'src/services/http/tqApi';
import { getResponse } from '../../actions/getResponse';
import { QueryParams } from '../../actions/QueryParams';
import { MessageResponse } from '../../actions/MessageResponse';
import { SuiteTestRoute, SuiteRoute, TestRoute } from '../../routes/Routes';
import { Test } from '../test/Test';
import { Suite } from '../suite/Suite';
import { SuiteTest } from './SuiteTest';

export const suiteTestDetach = (
  data: Partial<SuiteTest>,
  queryParams?: QueryParams<SuiteTest>
): Promise<MessageResponse> => {
  if (data.suite_id === undefined || data.test_id === undefined) {
    return Promise.reject(new Error('Must supply both suite_id and test_id'));
  }
  const config: QueryParams<SuiteTest> = {
    method: 'delete',
    url: `${SuiteTestRoute(data.suite_id!)}/${data.test_id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, SuiteTest>(tqApi, config);
};

export const suiteTestAttach = (
  data: Partial<SuiteTest>,
  queryParams?: QueryParams<SuiteTest>
): Promise<Test> => {
  if (data.suite_id === undefined || data.test_id === undefined) {
    return Promise.reject(new Error('Must supply both suite_id and test_id'));
  }
  const config: QueryParams<SuiteTest> = {
    method: 'post',
    url: SuiteTestRoute(data.suite_id!),
    params: queryParams?.params,
    data: {
      ...data,
      id: data.test_id,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Test>(config)
    : getResponse<Test>(tqApi, config);
};

/**
 * suiteAttachManyTest
 * This will remove any associations not in the list.
 * @param suiteId
 * @param list of children to associate
 * @param queryParams
 */
export const suiteAttachManyTest = (
  suiteId: number,
  list: Partial<Test>[],
  queryParams?: QueryParams<Suite>
): Promise<Suite> => {
  const config: QueryParams<Suite & { test: Partial<Test>[] }> = {
    method: 'put',
    url: `${SuiteRoute()}/${suiteId}`,
    params: queryParams?.params,
    data: {
      test: list,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Suite>(config)
    : getResponse<Suite>(tqApi, config);
};

/**
 * testAttachManySuite
 * This will remove any associations not in the list.
 * @param testId
 * @param list of children to associate
 * @param queryParams
 */
export const testAttachManySuite = (
  testId: number,
  list: Partial<Suite>[],
  queryParams?: QueryParams<Test>
): Promise<Test> => {
  const config: QueryParams<Test & { suite: Partial<Suite>[] }> = {
    method: 'put',
    url: `${TestRoute()}/${testId}`,
    params: queryParams?.params,
    data: {
      suite: list,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Test>(config)
    : getResponse<Test>(tqApi, config);
};

export const suiteTestUpdateOne = (
  suiteId: number,
  testId: number,
  data: Partial<SuiteTest>,
  queryParams?: QueryParams<SuiteTest>
): Promise<Suite> => {
  const config: QueryParams<{ suite_test: Partial<SuiteTest> }> = {
    method: 'put',
    url: `${SuiteTestRoute(suiteId)}/${testId}`,
    params: queryParams?.params,
    data: {
      suite_test: data,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Suite>(config)
    : getResponse<Suite, { suite_test: Partial<SuiteTest> }>(tqApi, config);
};

export const suiteAttachTest = (
  suiteId: number,
  testId: number,
  suiteTest?: Partial<SuiteTest>,
  queryParams?: QueryParams
): Promise<Suite> => {
  const config: QueryParams<{
    id: number;
    test_id;
    suite_test?: Partial<SuiteTest>;
  }> = {
    method: 'post',
    url: SuiteRoute(),
    params: queryParams?.params,
    data: {
      id: suiteId,
      test_id: testId,
      suite_test: suiteTest,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Suite>(config)
    : getResponse<
        Suite,
        { id: number; test_id; suite_test?: Partial<SuiteTest> }
      >(tqApi, config);
};

export const suiteCreateWithTest = (
  testId: number,
  data: Partial<Suite>,
  suiteTest?: Partial<SuiteTest>,
  queryParams?: QueryParams
): Promise<Suite> => {
  const config: QueryParams<
    Suite & { test_id: number; suite_test?: Partial<SuiteTest> }
  > = {
    method: 'post',
    url: SuiteRoute(),
    params: queryParams?.params,
    data: {
      ...data,
      test_id: testId,
      suite_test: suiteTest,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Suite>(config)
    : getResponse<
        Suite,
        Suite & { test_id: number; suite_test?: Partial<SuiteTest> }
      >(tqApi, config);
};

export const testAttachSuite = (
  testId: number,
  suiteId: number,
  suiteTest?: Partial<SuiteTest>,
  queryParams?: QueryParams
): Promise<Test> => {
  const config: QueryParams<{
    id: number;
    suite_id: number;
    suite_test?: Partial<SuiteTest>;
  }> = {
    method: 'post',
    url: TestRoute(),
    params: queryParams?.params,
    data: {
      id: testId,
      suite_id: suiteId,
      suite_test: suiteTest,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Test>(config)
    : getResponse<
        Test,
        { id: number; suite_id: number; suite_test: Partial<SuiteTest> }
      >(tqApi, config);
};

export const testCreateWithSuite = (
  suiteId: number,
  data: Partial<Test>,
  suiteTest?: Partial<SuiteTest>,
  queryParams?: QueryParams
): Promise<Test> => {
  const config: QueryParams<
    Test & { suite_id: number; suite_test?: Partial<SuiteTest> }
  > = {
    method: 'post',
    url: TestRoute(),
    params: queryParams?.params,
    data: {
      ...data,
      suite_id: suiteId,
      suite_test: suiteTest,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Test>(config)
    : getResponse<
        Test,
        Test & { suite_id: number; suite_test?: Partial<SuiteTest> }
      >(tqApi, config);
};
