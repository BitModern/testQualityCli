/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { tqApi } from 'src/services/http/tqApi';
import { getResponse } from '../../actions/getResponse';
import { QueryParams } from '../../actions/QueryParams';
import { LabelRoute } from '../../routes/Routes';
import { Label } from './Label';
import { LabelHistory } from './LabelHistory';

export const labelHistoryGet = (
  queryParams?: QueryParams<Label>
): Promise<LabelHistory[]> => {
  const config: QueryParams<Label> = {
    method: 'get',
    url: `${queryParams?.url || LabelRoute()}${
      queryParams?.id ? `/${queryParams?.id}` : ''
    }`,
    params: { revision_log: true, id: undefined, ...queryParams?.params },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<LabelHistory[]>(config)
    : getResponse<LabelHistory[], Label>(tqApi, config);
};
