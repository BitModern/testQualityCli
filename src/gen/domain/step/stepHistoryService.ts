/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { tqApi } from 'src/services/http/tqApi';
import { getResponse } from '../../actions/getResponse';
import { QueryParams } from '../../actions/QueryParams';
import { StepRoute } from '../../routes/Routes';
import { Step } from './Step';
import { StepHistory } from './StepHistory';

export const stepHistoryGet = (
  queryParams?: QueryParams<Step>
): Promise<StepHistory[]> => {
  const config: QueryParams<Step> = {
    method: 'get',
    url: `${queryParams?.url || StepRoute()}${
      queryParams?.id ? `/${queryParams?.id}` : ''
    }`,
    params: { revision_log: true, id: undefined, ...queryParams?.params },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<StepHistory[]>(config)
    : getResponse<StepHistory[], Step>(tqApi, config);
};
