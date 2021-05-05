/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { tqApi } from 'src/services/http/tqApi';
import { getResponse } from '../../actions/getResponse';
import { QueryParams } from '../../actions/QueryParams';
import { MessageResponse } from '../../actions/MessageResponse';
import { PlanSuiteRoute, PlanRoute, SuiteRoute } from '../../routes/Routes';
import { Suite } from '../suite/Suite';
import { Plan } from '../plan/Plan';
import { PlanSuite } from './PlanSuite';

export const planSuiteDetach = (
  data: Partial<PlanSuite>,
  queryParams?: QueryParams<PlanSuite>
): Promise<MessageResponse> => {
  if (data.plan_id === undefined || data.suite_id === undefined) {
    return Promise.reject(new Error('Must supply both plan_id and suite_id'));
  }
  const config: QueryParams<PlanSuite> = {
    method: 'delete',
    url: `${PlanSuiteRoute(data.plan_id!)}/${data.suite_id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, PlanSuite>(tqApi, config);
};

export const planSuiteAttach = (
  data: Partial<PlanSuite>,
  queryParams?: QueryParams<PlanSuite>
): Promise<Suite> => {
  if (data.plan_id === undefined || data.suite_id === undefined) {
    return Promise.reject(new Error('Must supply both plan_id and suite_id'));
  }
  const config: QueryParams<PlanSuite> = {
    method: 'post',
    url: PlanSuiteRoute(data.plan_id!),
    params: queryParams?.params,
    data: {
      ...data,
      id: data.suite_id,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Suite>(config)
    : getResponse<Suite>(tqApi, config);
};

/**
 * planAttachManySuite
 * This will remove any associations not in the list.
 * @param planId
 * @param list of children to associate
 * @param queryParams
 */
export const planAttachManySuite = (
  planId: number,
  list: Partial<Suite>[],
  queryParams?: QueryParams<Plan>
): Promise<Plan> => {
  const config: QueryParams<Plan & { suite: Partial<Suite>[] }> = {
    method: 'put',
    url: `${PlanRoute()}/${planId}`,
    params: queryParams?.params,
    data: {
      suite: list,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Plan>(config)
    : getResponse<Plan>(tqApi, config);
};

/**
 * suiteAttachManyPlan
 * This will remove any associations not in the list.
 * @param suiteId
 * @param list of children to associate
 * @param queryParams
 */
export const suiteAttachManyPlan = (
  suiteId: number,
  list: Partial<Plan>[],
  queryParams?: QueryParams<Suite>
): Promise<Suite> => {
  const config: QueryParams<Suite & { plan: Partial<Plan>[] }> = {
    method: 'put',
    url: `${SuiteRoute()}/${suiteId}`,
    params: queryParams?.params,
    data: {
      plan: list,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Suite>(config)
    : getResponse<Suite>(tqApi, config);
};

export const planSuiteUpdateOne = (
  planId: number,
  suiteId: number,
  data: Partial<PlanSuite>,
  queryParams?: QueryParams<PlanSuite>
): Promise<Plan> => {
  const config: QueryParams<{ plan_suite: Partial<PlanSuite> }> = {
    method: 'put',
    url: `${PlanSuiteRoute(planId)}/${suiteId}`,
    params: queryParams?.params,
    data: {
      plan_suite: data,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Plan>(config)
    : getResponse<Plan, { plan_suite: Partial<PlanSuite> }>(tqApi, config);
};

export const planAttachSuite = (
  planId: number,
  suiteId: number,
  planSuite?: Partial<PlanSuite>,
  queryParams?: QueryParams
): Promise<Plan> => {
  const config: QueryParams<{
    id: number;
    suite_id;
    plan_suite?: Partial<PlanSuite>;
  }> = {
    method: 'post',
    url: PlanRoute(),
    params: queryParams?.params,
    data: {
      id: planId,
      suite_id: suiteId,
      plan_suite: planSuite,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Plan>(config)
    : getResponse<
        Plan,
        { id: number; suite_id; plan_suite?: Partial<PlanSuite> }
      >(tqApi, config);
};

export const planCreateWithSuite = (
  suiteId: number,
  data: Partial<Plan>,
  planSuite?: Partial<PlanSuite>,
  queryParams?: QueryParams
): Promise<Plan> => {
  const config: QueryParams<
    Plan & { suite_id: number; plan_suite?: Partial<PlanSuite> }
  > = {
    method: 'post',
    url: PlanRoute(),
    params: queryParams?.params,
    data: {
      ...data,
      suite_id: suiteId,
      plan_suite: planSuite,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Plan>(config)
    : getResponse<
        Plan,
        Plan & { suite_id: number; plan_suite?: Partial<PlanSuite> }
      >(tqApi, config);
};

export const suiteAttachPlan = (
  suiteId: number,
  planId: number,
  planSuite?: Partial<PlanSuite>,
  queryParams?: QueryParams
): Promise<Suite> => {
  const config: QueryParams<{
    id: number;
    plan_id: number;
    plan_suite?: Partial<PlanSuite>;
  }> = {
    method: 'post',
    url: SuiteRoute(),
    params: queryParams?.params,
    data: {
      id: suiteId,
      plan_id: planId,
      plan_suite: planSuite,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Suite>(config)
    : getResponse<
        Suite,
        { id: number; plan_id: number; plan_suite: Partial<PlanSuite> }
      >(tqApi, config);
};

export const suiteCreateWithPlan = (
  planId: number,
  data: Partial<Suite>,
  planSuite?: Partial<PlanSuite>,
  queryParams?: QueryParams
): Promise<Suite> => {
  const config: QueryParams<
    Suite & { plan_id: number; plan_suite?: Partial<PlanSuite> }
  > = {
    method: 'post',
    url: SuiteRoute(),
    params: queryParams?.params,
    data: {
      ...data,
      plan_id: planId,
      plan_suite: planSuite,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Suite>(config)
    : getResponse<
        Suite,
        Suite & { plan_id: number; plan_suite?: Partial<PlanSuite> }
      >(tqApi, config);
};
