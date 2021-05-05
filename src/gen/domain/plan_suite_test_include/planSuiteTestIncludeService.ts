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
import { PlanSuiteTestIncludeRoute } from '../../routes/Routes';
import { PlanSuiteTestInclude } from './PlanSuiteTestInclude';
import { PlanSuiteTestIncludeApi } from './PlanSuiteTestIncludeApi';

export const planSuiteTestIncludeGetMany = (
  queryParams?: QueryParams<PlanSuiteTestInclude>
): Promise<ResourceList<PlanSuiteTestIncludeApi>> => {
  const config: QueryParams<PlanSuiteTestInclude> = {
    method: 'get',
    url: queryParams?.url || PlanSuiteTestIncludeRoute(),
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<PlanSuiteTestIncludeApi>>(config)
    : getResponse<ResourceList<PlanSuiteTestIncludeApi>, PlanSuiteTestInclude>(
        tqApi,
        config
      );
};

export const planSuiteTestIncludeGetOne = (
  id: number,
  queryParams?: QueryParams<PlanSuiteTestInclude>
): Promise<PlanSuiteTestIncludeApi> => {
  const config: QueryParams<PlanSuiteTestInclude> = {
    method: 'get',
    url: `${queryParams?.url || PlanSuiteTestIncludeRoute()}/${id}`,
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<PlanSuiteTestIncludeApi>(config)
    : getResponse<PlanSuiteTestIncludeApi, PlanSuiteTestInclude>(tqApi, config);
};

export const planSuiteTestIncludeDeleteOne = (
  id: number,
  queryParams?: QueryParams<PlanSuiteTestInclude>
): Promise<MessageResponse> => {
  const config: QueryParams<PlanSuiteTestInclude> = {
    method: 'delete',
    url: `${queryParams?.url || PlanSuiteTestIncludeRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, PlanSuiteTestInclude>(tqApi, config);
};

export const planSuiteTestIncludeUpdateOne = (
  id: number,
  data: Partial<PlanSuiteTestInclude>,
  queryParams?: QueryParams<PlanSuiteTestInclude>
): Promise<PlanSuiteTestInclude> => {
  const config: QueryParams<PlanSuiteTestInclude> = {
    method: 'put',
    url: `${queryParams?.url || PlanSuiteTestIncludeRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<PlanSuiteTestInclude>(config)
    : getResponse<PlanSuiteTestInclude>(tqApi, config);
};

export const planSuiteTestIncludeCreateOne = (
  data: Partial<PlanSuiteTestInclude>,
  queryParams?: QueryParams<PlanSuiteTestInclude>
): Promise<PlanSuiteTestInclude> => {
  const config: QueryParams<PlanSuiteTestInclude> = {
    method: 'post',
    url: queryParams?.url || PlanSuiteTestIncludeRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<PlanSuiteTestInclude>(config)
    : getResponse<PlanSuiteTestInclude>(tqApi, config);
};
