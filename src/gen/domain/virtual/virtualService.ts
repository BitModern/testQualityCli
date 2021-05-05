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
import { VirtualRoute } from '../../routes/Routes';
import { Virtual } from './Virtual';
import { VirtualApi } from './VirtualApi';

export const virtualGetMany = (
  queryParams?: QueryParams<Virtual>
): Promise<ResourceList<VirtualApi>> => {
  const config: QueryParams<Virtual> = {
    method: 'get',
    url: queryParams?.url || VirtualRoute(),
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<VirtualApi>>(config)
    : getResponse<ResourceList<VirtualApi>, Virtual>(tqApi, config);
};

export const virtualGetOne = (
  id: number,
  queryParams?: QueryParams<Virtual>
): Promise<VirtualApi> => {
  const config: QueryParams<Virtual> = {
    method: 'get',
    url: `${queryParams?.url || VirtualRoute()}/${id}`,
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<VirtualApi>(config)
    : getResponse<VirtualApi, Virtual>(tqApi, config);
};

export const virtualDeleteOne = (
  id: number,
  queryParams?: QueryParams<Virtual>
): Promise<MessageResponse> => {
  const config: QueryParams<Virtual> = {
    method: 'delete',
    url: `${queryParams?.url || VirtualRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, Virtual>(tqApi, config);
};

export const virtualUpdateOne = (
  id: number,
  data: Partial<Virtual>,
  queryParams?: QueryParams<Virtual>
): Promise<Virtual> => {
  const config: QueryParams<Virtual> = {
    method: 'put',
    url: `${queryParams?.url || VirtualRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Virtual>(config)
    : getResponse<Virtual>(tqApi, config);
};

export const virtualCreateOne = (
  data: Partial<Virtual>,
  queryParams?: QueryParams<Virtual>
): Promise<Virtual> => {
  const config: QueryParams<Virtual> = {
    method: 'post',
    url: queryParams?.url || VirtualRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Virtual>(config)
    : getResponse<Virtual>(tqApi, config);
};
