/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { tqApi } from 'src/services/http/tqApi';
import { getResponse } from '../../actions/getResponse';
import { QueryParams } from '../../actions/QueryParams';
import { RunResultRoute } from '../../routes/Routes';
import { RunResult } from './RunResult';
import { RunResultHistory } from './RunResultHistory';

export const runResultHistoryGet = (
  queryParams?: QueryParams<RunResult>
): Promise<RunResultHistory[]> => {
  const config: QueryParams<RunResult> = {
    method: 'get',
    url: `${queryParams?.url || RunResultRoute()}${
      queryParams?.id ? `/${queryParams?.id}` : ''
    }`,
    params: { revision_log: true, id: undefined, ...queryParams?.params },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<RunResultHistory[]>(config)
    : getResponse<RunResultHistory[], RunResult>(tqApi, config);
};
