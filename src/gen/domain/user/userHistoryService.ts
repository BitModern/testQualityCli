/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { tqApi } from 'src/services/http/tqApi';
import { getResponse } from '../../actions/getResponse';
import { QueryParams } from '../../actions/QueryParams';
import { UserRoute } from '../../routes/Routes';
import { User } from './User';
import { UserHistory } from './UserHistory';

export const userHistoryGet = (
  queryParams?: QueryParams<User>
): Promise<UserHistory[]> => {
  const config: QueryParams<User> = {
    method: 'get',
    url: `${queryParams?.url || UserRoute()}${
      queryParams?.id ? `/${queryParams?.id}` : ''
    }`,
    params: { revision_log: true, id: undefined, ...queryParams?.params },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<UserHistory[]>(config)
    : getResponse<UserHistory[], User>(tqApi, config);
};
