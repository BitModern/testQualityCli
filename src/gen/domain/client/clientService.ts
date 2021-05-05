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
import { ClientRoute } from '../../routes/Routes';
import { Client } from './Client';
import { ClientApi } from './ClientApi';

export const clientGetMany = (
  queryParams?: QueryParams<Client>
): Promise<ResourceList<ClientApi>> => {
  const config: QueryParams<Client> = {
    method: 'get',
    url: queryParams?.url || ClientRoute(),
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<ClientApi>>(config)
    : getResponse<ResourceList<ClientApi>, Client>(tqApi, config);
};

export const clientGetOne = (
  id: number,
  queryParams?: QueryParams<Client>
): Promise<ClientApi> => {
  const config: QueryParams<Client> = {
    method: 'get',
    url: `${queryParams?.url || ClientRoute()}/${id}`,
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ClientApi>(config)
    : getResponse<ClientApi, Client>(tqApi, config);
};

export const clientDeleteOne = (
  id: number,
  queryParams?: QueryParams<Client>
): Promise<MessageResponse> => {
  const config: QueryParams<Client> = {
    method: 'delete',
    url: `${queryParams?.url || ClientRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, Client>(tqApi, config);
};

export const clientUpdateOne = (
  id: number,
  data: Partial<Client>,
  queryParams?: QueryParams<Client>
): Promise<Client> => {
  const config: QueryParams<Client> = {
    method: 'put',
    url: `${queryParams?.url || ClientRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Client>(config)
    : getResponse<Client>(tqApi, config);
};

export const clientCreateOne = (
  data: Partial<Client>,
  queryParams?: QueryParams<Client>
): Promise<Client> => {
  const config: QueryParams<Client> = {
    method: 'post',
    url: queryParams?.url || ClientRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Client>(config)
    : getResponse<Client>(tqApi, config);
};
