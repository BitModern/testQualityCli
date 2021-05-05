/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { tqApi } from 'src/services/http/tqApi';
import { getResponse } from '../../actions/getResponse';
import { QueryParams } from '../../actions/QueryParams';
import { MessageResponse } from '../../actions/MessageResponse';
import { ResourceList } from '../../models/ResourceList';
import { TestRoute } from '../../routes/Routes';
import { Test } from './Test';
import { TestApi } from './TestApi';

export const testGetMany = (
  queryParams?: QueryParams<Test>
): Promise<ResourceList<TestApi>> => {
  const config: QueryParams<Test> = {
    method: 'get',
    url: queryParams?.url || TestRoute(),
    params: queryParams?.params || { per_page: -1, _with: 'suite' },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<TestApi>>(config)
    : getResponse<ResourceList<TestApi>, Test>(tqApi, config);
};

export const testGetOne = (
  id: number,
  queryParams?: QueryParams<Test>
): Promise<TestApi> => {
  const config: QueryParams<Test> = {
    method: 'get',
    url: `${queryParams?.url || TestRoute()}/${id}`,
    params: queryParams?.params || { per_page: -1, _with: 'suite' },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<TestApi>(config)
    : getResponse<TestApi, Test>(tqApi, config);
};

export const testDeleteOne = (
  id: number,
  queryParams?: QueryParams<Test>
): Promise<MessageResponse> => {
  const config: QueryParams<Test> = {
    method: 'delete',
    url: `${queryParams?.url || TestRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, Test>(tqApi, config);
};

export const testUpdateOne = (
  id: number,
  data: Partial<Test>,
  queryParams?: QueryParams<Test>
): Promise<Test> => {
  const config: QueryParams<Test> = {
    method: 'put',
    url: `${queryParams?.url || TestRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Test>(config)
    : getResponse<Test>(tqApi, config);
};

export const testCreateOne = (
  data: Partial<Test>,
  queryParams?: QueryParams<Test>
): Promise<Test> => {
  const config: QueryParams<Test> = {
    method: 'post',
    url: queryParams?.url || TestRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Test>(config)
    : getResponse<Test>(tqApi, config);
};
