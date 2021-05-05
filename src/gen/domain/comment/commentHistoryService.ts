/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { tqApi } from 'src/services/http/tqApi';
import { getResponse } from '../../actions/getResponse';
import { QueryParams } from '../../actions/QueryParams';
import { CommentRoute } from '../../routes/Routes';
import { Comment } from './Comment';
import { CommentHistory } from './CommentHistory';

export const commentHistoryGet = (
  queryParams?: QueryParams<Comment>
): Promise<CommentHistory[]> => {
  const config: QueryParams<Comment> = {
    method: 'get',
    url: `${queryParams?.url || CommentRoute()}${
      queryParams?.id ? `/${queryParams?.id}` : ''
    }`,
    params: { revision_log: true, id: undefined, ...queryParams?.params },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<CommentHistory[]>(config)
    : getResponse<CommentHistory[], Comment>(tqApi, config);
};
