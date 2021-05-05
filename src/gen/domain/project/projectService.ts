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
import { ProjectRoute } from '../../routes/Routes';
import { Project } from './Project';
import { ProjectApi } from './ProjectApi';

export const projectGetMany = (
  queryParams?: QueryParams<Project>
): Promise<ResourceList<ProjectApi>> => {
  const config: QueryParams<Project> = {
    method: 'get',
    url: queryParams?.url || ProjectRoute(),
    params: queryParams?.params || { per_page: -1 },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<ProjectApi>>(config)
    : getResponse<ResourceList<ProjectApi>, Project>(tqApi, config);
};

export const projectGetOne = (
  id: number,
  queryParams?: QueryParams<Project>
): Promise<ProjectApi> => {
  const config: QueryParams<Project> = {
    method: 'get',
    url: `${queryParams?.url || ProjectRoute()}/${id}`,
    params: queryParams?.params || { per_page: -1 },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ProjectApi>(config)
    : getResponse<ProjectApi, Project>(tqApi, config);
};

export const projectDeleteOne = (
  id: number,
  queryParams?: QueryParams<Project>
): Promise<MessageResponse> => {
  const config: QueryParams<Project> = {
    method: 'delete',
    url: `${queryParams?.url || ProjectRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, Project>(tqApi, config);
};

export const projectUpdateOne = (
  id: number,
  data: Partial<Project>,
  queryParams?: QueryParams<Project>
): Promise<Project> => {
  const config: QueryParams<Project> = {
    method: 'put',
    url: `${queryParams?.url || ProjectRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Project>(config)
    : getResponse<Project>(tqApi, config);
};

export const projectCreateOne = (
  data: Partial<Project>,
  queryParams?: QueryParams<Project>
): Promise<Project> => {
  const config: QueryParams<Project> = {
    method: 'post',
    url: queryParams?.url || ProjectRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Project>(config)
    : getResponse<Project>(tqApi, config);
};
