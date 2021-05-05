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
import { RunResultRoute } from '../../routes/Routes';
import { RunResult } from './RunResult';
import { RunResultApi } from './RunResultApi';

export const runResultGetMany = (
  queryParams?: QueryParams<RunResult>
): Promise<ResourceList<RunResultApi>> => {
  const config: QueryParams<RunResult> = {
    method: 'get',
    url: queryParams?.url || RunResultRoute(),
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<RunResultApi>>(config)
    : getResponse<ResourceList<RunResultApi>, RunResult>(tqApi, config);
};

export const runResultGetOne = (
  id: number,
  queryParams?: QueryParams<RunResult>
): Promise<RunResultApi> => {
  const config: QueryParams<RunResult> = {
    method: 'get',
    url: `${queryParams?.url || RunResultRoute()}/${id}`,
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<RunResultApi>(config)
    : getResponse<RunResultApi, RunResult>(tqApi, config);
};

export const runResultDeleteOne = (
  id: number,
  queryParams?: QueryParams<RunResult>
): Promise<MessageResponse> => {
  const config: QueryParams<RunResult> = {
    method: 'delete',
    url: `${queryParams?.url || RunResultRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, RunResult>(tqApi, config);
};

export const runResultUpdateOne = (
  id: number,
  data: Partial<RunResult>,
  queryParams?: QueryParams<RunResult>
): Promise<RunResult> => {
  const config: QueryParams<RunResult> = {
    method: 'put',
    url: `${queryParams?.url || RunResultRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<RunResult>(config)
    : getResponse<RunResult>(tqApi, config);
};

export const runResultCreateOne = (
  data: Partial<RunResult>,
  queryParams?: QueryParams<RunResult>
): Promise<RunResult> => {
  const config: QueryParams<RunResult> = {
    method: 'post',
    url: queryParams?.url || RunResultRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<RunResult>(config)
    : getResponse<RunResult>(tqApi, config);
};
