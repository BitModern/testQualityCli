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
import { RunRoute } from '../../routes/Routes';
import { Run } from './Run';
import { RunApi } from './RunApi';

export const runGetMany = (
  queryParams?: QueryParams<Run>
): Promise<ResourceList<RunApi>> => {
  const config: QueryParams<Run> = {
    method: 'get',
    url: queryParams?.url || RunRoute(),
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<RunApi>>(config)
    : getResponse<ResourceList<RunApi>, Run>(tqApi, config);
};

export const runGetOne = (
  id: number,
  queryParams?: QueryParams<Run>
): Promise<RunApi> => {
  const config: QueryParams<Run> = {
    method: 'get',
    url: `${queryParams?.url || RunRoute()}/${id}`,
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<RunApi>(config)
    : getResponse<RunApi, Run>(tqApi, config);
};

export const runDeleteOne = (
  id: number,
  queryParams?: QueryParams<Run>
): Promise<MessageResponse> => {
  const config: QueryParams<Run> = {
    method: 'delete',
    url: `${queryParams?.url || RunRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, Run>(tqApi, config);
};

export const runUpdateOne = (
  id: number,
  data: Partial<Run>,
  queryParams?: QueryParams<Run>
): Promise<Run> => {
  const config: QueryParams<Run> = {
    method: 'put',
    url: `${queryParams?.url || RunRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Run>(config)
    : getResponse<Run>(tqApi, config);
};

export const runCreateOne = (
  data: Partial<Run>,
  queryParams?: QueryParams<Run>
): Promise<Run> => {
  const config: QueryParams<Run> = {
    method: 'post',
    url: queryParams?.url || RunRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Run>(config)
    : getResponse<Run>(tqApi, config);
};
