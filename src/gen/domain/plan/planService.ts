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
import { PlanRoute } from '../../routes/Routes';
import { Plan } from './Plan';
import { PlanApi } from './PlanApi';

export const planGetMany = (
  queryParams?: QueryParams<Plan>
): Promise<ResourceList<PlanApi>> => {
  const config: QueryParams<Plan> = {
    method: 'get',
    url: queryParams?.url || PlanRoute(),
    params: queryParams?.params || { per_page: -1 },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<PlanApi>>(config)
    : getResponse<ResourceList<PlanApi>, Plan>(tqApi, config);
};

export const planGetOne = (
  id: number,
  queryParams?: QueryParams<Plan>
): Promise<PlanApi> => {
  const config: QueryParams<Plan> = {
    method: 'get',
    url: `${queryParams?.url || PlanRoute()}/${id}`,
    params: queryParams?.params || { per_page: -1 },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<PlanApi>(config)
    : getResponse<PlanApi, Plan>(tqApi, config);
};

export const planDeleteOne = (
  id: number,
  queryParams?: QueryParams<Plan>
): Promise<MessageResponse> => {
  const config: QueryParams<Plan> = {
    method: 'delete',
    url: `${queryParams?.url || PlanRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, Plan>(tqApi, config);
};

export const planUpdateOne = (
  id: number,
  data: Partial<Plan>,
  queryParams?: QueryParams<Plan>
): Promise<Plan> => {
  const config: QueryParams<Plan> = {
    method: 'put',
    url: `${queryParams?.url || PlanRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Plan>(config)
    : getResponse<Plan>(tqApi, config);
};

export const planCreateOne = (
  data: Partial<Plan>,
  queryParams?: QueryParams<Plan>
): Promise<Plan> => {
  const config: QueryParams<Plan> = {
    method: 'post',
    url: queryParams?.url || PlanRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Plan>(config)
    : getResponse<Plan>(tqApi, config);
};
