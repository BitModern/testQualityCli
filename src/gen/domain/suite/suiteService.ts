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
import { SuiteRoute } from '../../routes/Routes';
import { Suite } from './Suite';
import { SuiteApi } from './SuiteApi';

export const suiteGetMany = (
  queryParams?: QueryParams<Suite>
): Promise<ResourceList<SuiteApi>> => {
  const config: QueryParams<Suite> = {
    method: 'get',
    url: queryParams?.url || SuiteRoute(),
    params: queryParams?.params || { per_page: -1, _with: 'plan' },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<SuiteApi>>(config)
    : getResponse<ResourceList<SuiteApi>, Suite>(tqApi, config);
};

export const suiteGetOne = (
  id: number,
  queryParams?: QueryParams<Suite>
): Promise<SuiteApi> => {
  const config: QueryParams<Suite> = {
    method: 'get',
    url: `${queryParams?.url || SuiteRoute()}/${id}`,
    params: queryParams?.params || { per_page: -1, _with: 'plan' },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<SuiteApi>(config)
    : getResponse<SuiteApi, Suite>(tqApi, config);
};

export const suiteDeleteOne = (
  id: number,
  queryParams?: QueryParams<Suite>
): Promise<MessageResponse> => {
  const config: QueryParams<Suite> = {
    method: 'delete',
    url: `${queryParams?.url || SuiteRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, Suite>(tqApi, config);
};

export const suiteUpdateOne = (
  id: number,
  data: Partial<Suite>,
  queryParams?: QueryParams<Suite>
): Promise<Suite> => {
  const config: QueryParams<Suite> = {
    method: 'put',
    url: `${queryParams?.url || SuiteRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Suite>(config)
    : getResponse<Suite>(tqApi, config);
};

export const suiteCreateOne = (
  data: Partial<Suite>,
  queryParams?: QueryParams<Suite>
): Promise<Suite> => {
  const config: QueryParams<Suite> = {
    method: 'post',
    url: queryParams?.url || SuiteRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Suite>(config)
    : getResponse<Suite>(tqApi, config);
};
