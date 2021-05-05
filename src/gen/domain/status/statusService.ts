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
import { StatusRoute } from '../../routes/Routes';
import { Status } from './Status';
import { StatusApi } from './StatusApi';

export const statusGetMany = (
  queryParams?: QueryParams<Status>
): Promise<ResourceList<StatusApi>> => {
  const config: QueryParams<Status> = {
    method: 'get',
    url: queryParams?.url || StatusRoute(),
    params: queryParams?.params || { per_page: -1 },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<StatusApi>>(config)
    : getResponse<ResourceList<StatusApi>, Status>(tqApi, config);
};

export const statusGetOne = (
  id: number,
  queryParams?: QueryParams<Status>
): Promise<StatusApi> => {
  const config: QueryParams<Status> = {
    method: 'get',
    url: `${queryParams?.url || StatusRoute()}/${id}`,
    params: queryParams?.params || { per_page: -1 },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<StatusApi>(config)
    : getResponse<StatusApi, Status>(tqApi, config);
};

export const statusDeleteOne = (
  id: number,
  queryParams?: QueryParams<Status>
): Promise<MessageResponse> => {
  const config: QueryParams<Status> = {
    method: 'delete',
    url: `${queryParams?.url || StatusRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, Status>(tqApi, config);
};

export const statusUpdateOne = (
  id: number,
  data: Partial<Status>,
  queryParams?: QueryParams<Status>
): Promise<Status> => {
  const config: QueryParams<Status> = {
    method: 'put',
    url: `${queryParams?.url || StatusRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Status>(config)
    : getResponse<Status>(tqApi, config);
};

export const statusCreateOne = (
  data: Partial<Status>,
  queryParams?: QueryParams<Status>
): Promise<Status> => {
  const config: QueryParams<Status> = {
    method: 'post',
    url: queryParams?.url || StatusRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Status>(config)
    : getResponse<Status>(tqApi, config);
};
