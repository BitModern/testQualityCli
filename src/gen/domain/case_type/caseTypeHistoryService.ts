/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { tqApi } from 'src/services/http/tqApi';
import { getResponse } from '../../actions/getResponse';
import { QueryParams } from '../../actions/QueryParams';
import { CaseTypeRoute } from '../../routes/Routes';
import { CaseType } from './CaseType';
import { CaseTypeHistory } from './CaseTypeHistory';

export const caseTypeHistoryGet = (
  queryParams?: QueryParams<CaseType>
): Promise<CaseTypeHistory[]> => {
  const config: QueryParams<CaseType> = {
    method: 'get',
    url: `${queryParams?.url || CaseTypeRoute()}${
      queryParams?.id ? `/${queryParams?.id}` : ''
    }`,
    params: { revision_log: true, id: undefined, ...queryParams?.params },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<CaseTypeHistory[]>(config)
    : getResponse<CaseTypeHistory[], CaseType>(tqApi, config);
};
