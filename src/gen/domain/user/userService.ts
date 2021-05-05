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
import { UserRoute } from '../../routes/Routes';
import { User } from './User';
import { UserApi } from './UserApi';

export const userGetMany = (
  queryParams?: QueryParams<User>
): Promise<ResourceList<UserApi>> => {
  const config: QueryParams<User> = {
    method: 'get',
    url: queryParams?.url || UserRoute(),
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<UserApi>>(config)
    : getResponse<ResourceList<UserApi>, User>(tqApi, config);
};

export const userGetOne = (
  id: number,
  queryParams?: QueryParams<User>
): Promise<UserApi> => {
  const config: QueryParams<User> = {
    method: 'get',
    url: `${queryParams?.url || UserRoute()}/${id}`,
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<UserApi>(config)
    : getResponse<UserApi, User>(tqApi, config);
};

export const userDeleteOne = (
  id: number,
  queryParams?: QueryParams<User>
): Promise<MessageResponse> => {
  const config: QueryParams<User> = {
    method: 'delete',
    url: `${queryParams?.url || UserRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, User>(tqApi, config);
};

export const userUpdateOne = (
  id: number,
  data: Partial<User>,
  queryParams?: QueryParams<User>
): Promise<User> => {
  const config: QueryParams<User> = {
    method: 'put',
    url: `${queryParams?.url || UserRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<User>(config)
    : getResponse<User>(tqApi, config);
};

export const userCreateOne = (
  data: Partial<User>,
  queryParams?: QueryParams<User>
): Promise<User> => {
  const config: QueryParams<User> = {
    method: 'post',
    url: queryParams?.url || UserRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<User>(config)
    : getResponse<User>(tqApi, config);
};
