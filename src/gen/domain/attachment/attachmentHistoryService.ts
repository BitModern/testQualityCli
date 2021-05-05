/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { tqApi } from 'src/services/http/tqApi';
import { getResponse } from '../../actions/getResponse';
import { QueryParams } from '../../actions/QueryParams';
import { AttachmentRoute } from '../../routes/Routes';
import { Attachment } from './Attachment';
import { AttachmentHistory } from './AttachmentHistory';

export const attachmentHistoryGet = (
  queryParams?: QueryParams<Attachment>
): Promise<AttachmentHistory[]> => {
  const config: QueryParams<Attachment> = {
    method: 'get',
    url: `${queryParams?.url || AttachmentRoute()}${
      queryParams?.id ? `/${queryParams?.id}` : ''
    }`,
    params: { revision_log: true, id: undefined, ...queryParams?.params },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<AttachmentHistory[]>(config)
    : getResponse<AttachmentHistory[], Attachment>(tqApi, config);
};
