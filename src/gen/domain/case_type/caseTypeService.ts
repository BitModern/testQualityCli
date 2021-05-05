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
import { CaseTypeRoute } from '../../routes/Routes';
import { CaseType } from './CaseType';
import { CaseTypeApi } from './CaseTypeApi';

export const caseTypeGetMany = (
  queryParams?: QueryParams<CaseType>
): Promise<ResourceList<CaseTypeApi>> => {
  const config: QueryParams<CaseType> = {
    method: 'get',
    url: queryParams?.url || CaseTypeRoute(),
    params: queryParams?.params || { per_page: -1 },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<CaseTypeApi>>(config)
    : getResponse<ResourceList<CaseTypeApi>, CaseType>(tqApi, config);
};

export const caseTypeGetOne = (
  id: number,
  queryParams?: QueryParams<CaseType>
): Promise<CaseTypeApi> => {
  const config: QueryParams<CaseType> = {
    method: 'get',
    url: `${queryParams?.url || CaseTypeRoute()}/${id}`,
    params: queryParams?.params || { per_page: -1 },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<CaseTypeApi>(config)
    : getResponse<CaseTypeApi, CaseType>(tqApi, config);
};

export const caseTypeDeleteOne = (
  id: number,
  queryParams?: QueryParams<CaseType>
): Promise<MessageResponse> => {
  const config: QueryParams<CaseType> = {
    method: 'delete',
    url: `${queryParams?.url || CaseTypeRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, CaseType>(tqApi, config);
};

export const caseTypeUpdateOne = (
  id: number,
  data: Partial<CaseType>,
  queryParams?: QueryParams<CaseType>
): Promise<CaseType> => {
  const config: QueryParams<CaseType> = {
    method: 'put',
    url: `${queryParams?.url || CaseTypeRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<CaseType>(config)
    : getResponse<CaseType>(tqApi, config);
};

export const caseTypeCreateOne = (
  data: Partial<CaseType>,
  queryParams?: QueryParams<CaseType>
): Promise<CaseType> => {
  const config: QueryParams<CaseType> = {
    method: 'post',
    url: queryParams?.url || CaseTypeRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<CaseType>(config)
    : getResponse<CaseType>(tqApi, config);
};
