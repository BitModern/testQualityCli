/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { tqApi } from 'src/services/http/tqApi';
import { getResponse } from '../../actions/getResponse';
import { QueryParams } from '../../actions/QueryParams';
import { MessageResponse } from '../../actions/MessageResponse';
import { PlanPurposeRoute, PurposeRoute, PlanRoute } from '../../routes/Routes';
import { Plan } from '../plan/Plan';
import { Purpose } from '../purpose/Purpose';
import { PlanPurpose } from './PlanPurpose';

export const planPurposeDetach = (
  data: Partial<PlanPurpose>,
  queryParams?: QueryParams<PlanPurpose>
): Promise<MessageResponse> => {
  if (data.purpose_id === undefined || data.plan_id === undefined) {
    return Promise.reject(new Error('Must supply both purpose_id and plan_id'));
  }
  const config: QueryParams<PlanPurpose> = {
    method: 'delete',
    url: `${PlanPurposeRoute(data.purpose_id!)}/${data.plan_id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, PlanPurpose>(tqApi, config);
};

export const planPurposeAttach = (
  data: Partial<PlanPurpose>,
  queryParams?: QueryParams<PlanPurpose>
): Promise<Plan> => {
  if (data.purpose_id === undefined || data.plan_id === undefined) {
    return Promise.reject(new Error('Must supply both purpose_id and plan_id'));
  }
  const config: QueryParams<PlanPurpose> = {
    method: 'post',
    url: PlanPurposeRoute(data.purpose_id!),
    params: queryParams?.params,
    data: {
      ...data,
      id: data.plan_id,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Plan>(config)
    : getResponse<Plan>(tqApi, config);
};

/**
 * purposeAttachManyPlan
 * This will remove any associations not in the list.
 * @param purposeId
 * @param list of children to associate
 * @param queryParams
 */
export const purposeAttachManyPlan = (
  purposeId: number,
  list: Partial<Plan>[],
  queryParams?: QueryParams<Purpose>
): Promise<Purpose> => {
  const config: QueryParams<Purpose & { plan: Partial<Plan>[] }> = {
    method: 'put',
    url: `${PurposeRoute()}/${purposeId}`,
    params: queryParams?.params,
    data: {
      plan: list,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Purpose>(config)
    : getResponse<Purpose>(tqApi, config);
};

/**
 * planAttachManyPurpose
 * This will remove any associations not in the list.
 * @param planId
 * @param list of children to associate
 * @param queryParams
 */
export const planAttachManyPurpose = (
  planId: number,
  list: Partial<Purpose>[],
  queryParams?: QueryParams<Plan>
): Promise<Plan> => {
  const config: QueryParams<Plan & { purpose: Partial<Purpose>[] }> = {
    method: 'put',
    url: `${PlanRoute()}/${planId}`,
    params: queryParams?.params,
    data: {
      purpose: list,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Plan>(config)
    : getResponse<Plan>(tqApi, config);
};

export const planPurposeUpdateOne = (
  purposeId: number,
  planId: number,
  data: Partial<PlanPurpose>,
  queryParams?: QueryParams<PlanPurpose>
): Promise<Purpose> => {
  const config: QueryParams<{ plan_purpose: Partial<PlanPurpose> }> = {
    method: 'put',
    url: `${PlanPurposeRoute(purposeId)}/${planId}`,
    params: queryParams?.params,
    data: {
      plan_purpose: data,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Purpose>(config)
    : getResponse<Purpose, { plan_purpose: Partial<PlanPurpose> }>(
        tqApi,
        config
      );
};

export const purposeAttachPlan = (
  purposeId: number,
  planId: number,
  planPurpose?: Partial<PlanPurpose>,
  queryParams?: QueryParams
): Promise<Purpose> => {
  const config: QueryParams<{
    id: number;
    plan_id;
    plan_purpose?: Partial<PlanPurpose>;
  }> = {
    method: 'post',
    url: PurposeRoute(),
    params: queryParams?.params,
    data: {
      id: purposeId,
      plan_id: planId,
      plan_purpose: planPurpose,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Purpose>(config)
    : getResponse<
        Purpose,
        { id: number; plan_id; plan_purpose?: Partial<PlanPurpose> }
      >(tqApi, config);
};

export const purposeCreateWithPlan = (
  planId: number,
  data: Partial<Purpose>,
  planPurpose?: Partial<PlanPurpose>,
  queryParams?: QueryParams
): Promise<Purpose> => {
  const config: QueryParams<
    Purpose & { plan_id: number; plan_purpose?: Partial<PlanPurpose> }
  > = {
    method: 'post',
    url: PurposeRoute(),
    params: queryParams?.params,
    data: {
      ...data,
      plan_id: planId,
      plan_purpose: planPurpose,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Purpose>(config)
    : getResponse<
        Purpose,
        Purpose & { plan_id: number; plan_purpose?: Partial<PlanPurpose> }
      >(tqApi, config);
};

export const planAttachPurpose = (
  planId: number,
  purposeId: number,
  planPurpose?: Partial<PlanPurpose>,
  queryParams?: QueryParams
): Promise<Plan> => {
  const config: QueryParams<{
    id: number;
    purpose_id: number;
    plan_purpose?: Partial<PlanPurpose>;
  }> = {
    method: 'post',
    url: PlanRoute(),
    params: queryParams?.params,
    data: {
      id: planId,
      purpose_id: purposeId,
      plan_purpose: planPurpose,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Plan>(config)
    : getResponse<
        Plan,
        { id: number; purpose_id: number; plan_purpose: Partial<PlanPurpose> }
      >(tqApi, config);
};

export const planCreateWithPurpose = (
  purposeId: number,
  data: Partial<Plan>,
  planPurpose?: Partial<PlanPurpose>,
  queryParams?: QueryParams
): Promise<Plan> => {
  const config: QueryParams<
    Plan & { purpose_id: number; plan_purpose?: Partial<PlanPurpose> }
  > = {
    method: 'post',
    url: PlanRoute(),
    params: queryParams?.params,
    data: {
      ...data,
      purpose_id: purposeId,
      plan_purpose: planPurpose,
    },
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Plan>(config)
    : getResponse<
        Plan,
        Plan & { purpose_id: number; plan_purpose?: Partial<PlanPurpose> }
      >(tqApi, config);
};
