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
import { MilestoneRoute } from '../../routes/Routes';
import { Milestone } from './Milestone';
import { MilestoneApi } from './MilestoneApi';

export const milestoneGetMany = (
  queryParams?: QueryParams<Milestone>
): Promise<ResourceList<MilestoneApi>> => {
  const config: QueryParams<Milestone> = {
    method: 'get',
    url: queryParams?.url || MilestoneRoute(),
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<MilestoneApi>>(config)
    : getResponse<ResourceList<MilestoneApi>, Milestone>(tqApi, config);
};

export const milestoneGetOne = (
  id: number,
  queryParams?: QueryParams<Milestone>
): Promise<MilestoneApi> => {
  const config: QueryParams<Milestone> = {
    method: 'get',
    url: `${queryParams?.url || MilestoneRoute()}/${id}`,
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MilestoneApi>(config)
    : getResponse<MilestoneApi, Milestone>(tqApi, config);
};

export const milestoneDeleteOne = (
  id: number,
  queryParams?: QueryParams<Milestone>
): Promise<MessageResponse> => {
  const config: QueryParams<Milestone> = {
    method: 'delete',
    url: `${queryParams?.url || MilestoneRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, Milestone>(tqApi, config);
};

export const milestoneUpdateOne = (
  id: number,
  data: Partial<Milestone>,
  queryParams?: QueryParams<Milestone>
): Promise<Milestone> => {
  const config: QueryParams<Milestone> = {
    method: 'put',
    url: `${queryParams?.url || MilestoneRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Milestone>(config)
    : getResponse<Milestone>(tqApi, config);
};

export const milestoneCreateOne = (
  data: Partial<Milestone>,
  queryParams?: QueryParams<Milestone>
): Promise<Milestone> => {
  const config: QueryParams<Milestone> = {
    method: 'post',
    url: queryParams?.url || MilestoneRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Milestone>(config)
    : getResponse<Milestone>(tqApi, config);
};
