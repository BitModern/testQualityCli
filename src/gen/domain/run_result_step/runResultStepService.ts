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
import { RunResultStepRoute } from '../../routes/Routes';
import { RunResultStep } from './RunResultStep';
import { RunResultStepApi } from './RunResultStepApi';

export const runResultStepGetMany = (
  queryParams?: QueryParams<RunResultStep>
): Promise<ResourceList<RunResultStepApi>> => {
  const config: QueryParams<RunResultStep> = {
    method: 'get',
    url: queryParams?.url || RunResultStepRoute(),
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<RunResultStepApi>>(config)
    : getResponse<ResourceList<RunResultStepApi>, RunResultStep>(tqApi, config);
};

export const runResultStepGetOne = (
  id: number,
  queryParams?: QueryParams<RunResultStep>
): Promise<RunResultStepApi> => {
  const config: QueryParams<RunResultStep> = {
    method: 'get',
    url: `${queryParams?.url || RunResultStepRoute()}/${id}`,
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<RunResultStepApi>(config)
    : getResponse<RunResultStepApi, RunResultStep>(tqApi, config);
};

export const runResultStepDeleteOne = (
  id: number,
  queryParams?: QueryParams<RunResultStep>
): Promise<MessageResponse> => {
  const config: QueryParams<RunResultStep> = {
    method: 'delete',
    url: `${queryParams?.url || RunResultStepRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, RunResultStep>(tqApi, config);
};

export const runResultStepUpdateOne = (
  id: number,
  data: Partial<RunResultStep>,
  queryParams?: QueryParams<RunResultStep>
): Promise<RunResultStep> => {
  const config: QueryParams<RunResultStep> = {
    method: 'put',
    url: `${queryParams?.url || RunResultStepRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<RunResultStep>(config)
    : getResponse<RunResultStep>(tqApi, config);
};

export const runResultStepCreateOne = (
  data: Partial<RunResultStep>,
  queryParams?: QueryParams<RunResultStep>
): Promise<RunResultStep> => {
  const config: QueryParams<RunResultStep> = {
    method: 'post',
    url: queryParams?.url || RunResultStepRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<RunResultStep>(config)
    : getResponse<RunResultStep>(tqApi, config);
};
