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
import { LabelRoute } from '../../routes/Routes';
import { Label } from './Label';
import { LabelApi } from './LabelApi';

export const labelGetMany = (
  queryParams?: QueryParams<Label>
): Promise<ResourceList<LabelApi>> => {
  const config: QueryParams<Label> = {
    method: 'get',
    url: queryParams?.url || LabelRoute(),
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<LabelApi>>(config)
    : getResponse<ResourceList<LabelApi>, Label>(tqApi, config);
};

export const labelGetOne = (
  id: number,
  queryParams?: QueryParams<Label>
): Promise<LabelApi> => {
  const config: QueryParams<Label> = {
    method: 'get',
    url: `${queryParams?.url || LabelRoute()}/${id}`,
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<LabelApi>(config)
    : getResponse<LabelApi, Label>(tqApi, config);
};

export const labelDeleteOne = (
  id: number,
  queryParams?: QueryParams<Label>
): Promise<MessageResponse> => {
  const config: QueryParams<Label> = {
    method: 'delete',
    url: `${queryParams?.url || LabelRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, Label>(tqApi, config);
};

export const labelUpdateOne = (
  id: number,
  data: Partial<Label>,
  queryParams?: QueryParams<Label>
): Promise<Label> => {
  const config: QueryParams<Label> = {
    method: 'put',
    url: `${queryParams?.url || LabelRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Label>(config)
    : getResponse<Label>(tqApi, config);
};

export const labelCreateOne = (
  data: Partial<Label>,
  queryParams?: QueryParams<Label>
): Promise<Label> => {
  const config: QueryParams<Label> = {
    method: 'post',
    url: queryParams?.url || LabelRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Label>(config)
    : getResponse<Label>(tqApi, config);
};
