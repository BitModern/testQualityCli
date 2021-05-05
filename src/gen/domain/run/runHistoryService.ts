/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { tqApi } from 'src/services/http/tqApi';
import { getResponse } from '../../actions/getResponse';
import { QueryParams } from '../../actions/QueryParams';
import { RunRoute } from '../../routes/Routes';
import { Run } from './Run';
import { RunHistory } from './RunHistory';

export const runHistoryGet = (
  queryParams?: QueryParams<Run>
): Promise<RunHistory[]> => {
  const config: QueryParams<Run> = {
    method: 'get',
    url: `${queryParams?.url || RunRoute()}${
      queryParams?.id ? `/${queryParams?.id}` : ''
    }`,
    params: { revision_log: true, id: undefined, ...queryParams?.params },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<RunHistory[]>(config)
    : getResponse<RunHistory[], Run>(tqApi, config);
};
