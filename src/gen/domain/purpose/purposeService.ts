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
import { PurposeRoute } from '../../routes/Routes';
import { Purpose } from './Purpose';
import { PurposeApi } from './PurposeApi';

export const purposeGetMany = (
  queryParams?: QueryParams<Purpose>
): Promise<ResourceList<PurposeApi>> => {
  const config: QueryParams<Purpose> = {
    method: 'get',
    url: queryParams?.url || PurposeRoute(),
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<PurposeApi>>(config)
    : getResponse<ResourceList<PurposeApi>, Purpose>(tqApi, config);
};

export const purposeGetOne = (
  id: number,
  queryParams?: QueryParams<Purpose>
): Promise<PurposeApi> => {
  const config: QueryParams<Purpose> = {
    method: 'get',
    url: `${queryParams?.url || PurposeRoute()}/${id}`,
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<PurposeApi>(config)
    : getResponse<PurposeApi, Purpose>(tqApi, config);
};

export const purposeDeleteOne = (
  id: number,
  queryParams?: QueryParams<Purpose>
): Promise<MessageResponse> => {
  const config: QueryParams<Purpose> = {
    method: 'delete',
    url: `${queryParams?.url || PurposeRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, Purpose>(tqApi, config);
};

export const purposeUpdateOne = (
  id: number,
  data: Partial<Purpose>,
  queryParams?: QueryParams<Purpose>
): Promise<Purpose> => {
  const config: QueryParams<Purpose> = {
    method: 'put',
    url: `${queryParams?.url || PurposeRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Purpose>(config)
    : getResponse<Purpose>(tqApi, config);
};

export const purposeCreateOne = (
  data: Partial<Purpose>,
  queryParams?: QueryParams<Purpose>
): Promise<Purpose> => {
  const config: QueryParams<Purpose> = {
    method: 'post',
    url: queryParams?.url || PurposeRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Purpose>(config)
    : getResponse<Purpose>(tqApi, config);
};
