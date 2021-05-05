/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { tqApi } from 'src/services/http/tqApi';
import { getResponse } from '../../actions/getResponse';
import { QueryParams } from '../../actions/QueryParams';
import { PurposeRoute } from '../../routes/Routes';
import { Purpose } from './Purpose';
import { PurposeHistory } from './PurposeHistory';

export const purposeHistoryGet = (
  queryParams?: QueryParams<Purpose>
): Promise<PurposeHistory[]> => {
  const config: QueryParams<Purpose> = {
    method: 'get',
    url: `${queryParams?.url || PurposeRoute()}${
      queryParams?.id ? `/${queryParams?.id}` : ''
    }`,
    params: { revision_log: true, id: undefined, ...queryParams?.params },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<PurposeHistory[]>(config)
    : getResponse<PurposeHistory[], Purpose>(tqApi, config);
};
