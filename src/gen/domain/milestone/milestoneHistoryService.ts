/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { tqApi } from 'src/services/http/tqApi';
import { getResponse } from '../../actions/getResponse';
import { QueryParams } from '../../actions/QueryParams';
import { MilestoneRoute } from '../../routes/Routes';
import { Milestone } from './Milestone';
import { MilestoneHistory } from './MilestoneHistory';

export const milestoneHistoryGet = (
  queryParams?: QueryParams<Milestone>
): Promise<MilestoneHistory[]> => {
  const config: QueryParams<Milestone> = {
    method: 'get',
    url: `${queryParams?.url || MilestoneRoute()}${
      queryParams?.id ? `/${queryParams?.id}` : ''
    }`,
    params: { revision_log: true, id: undefined, ...queryParams?.params },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MilestoneHistory[]>(config)
    : getResponse<MilestoneHistory[], Milestone>(tqApi, config);
};
