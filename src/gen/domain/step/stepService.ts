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
import { StepRoute } from '../../routes/Routes';
import { Step } from './Step';
import { StepApi } from './StepApi';

export const stepGetMany = (
  queryParams?: QueryParams<Step>
): Promise<ResourceList<StepApi>> => {
  const config: QueryParams<Step> = {
    method: 'get',
    url: queryParams?.url || StepRoute(),
    params: queryParams?.params || { per_page: -1, _with: 'test' },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<StepApi>>(config)
    : getResponse<ResourceList<StepApi>, Step>(tqApi, config);
};

export const stepGetOne = (
  id: number,
  queryParams?: QueryParams<Step>
): Promise<StepApi> => {
  const config: QueryParams<Step> = {
    method: 'get',
    url: `${queryParams?.url || StepRoute()}/${id}`,
    params: queryParams?.params || { per_page: -1, _with: 'test' },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<StepApi>(config)
    : getResponse<StepApi, Step>(tqApi, config);
};

export const stepDeleteOne = (
  id: number,
  queryParams?: QueryParams<Step>
): Promise<MessageResponse> => {
  const config: QueryParams<Step> = {
    method: 'delete',
    url: `${queryParams?.url || StepRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, Step>(tqApi, config);
};

export const stepUpdateOne = (
  id: number,
  data: Partial<Step>,
  queryParams?: QueryParams<Step>
): Promise<Step> => {
  const config: QueryParams<Step> = {
    method: 'put',
    url: `${queryParams?.url || StepRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Step>(config)
    : getResponse<Step>(tqApi, config);
};

export const stepCreateOne = (
  data: Partial<Step>,
  queryParams?: QueryParams<Step>
): Promise<Step> => {
  const config: QueryParams<Step> = {
    method: 'post',
    url: queryParams?.url || StepRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Step>(config)
    : getResponse<Step>(tqApi, config);
};
