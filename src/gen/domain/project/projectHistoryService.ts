/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { tqApi } from 'src/services/http/tqApi';
import { getResponse } from '../../actions/getResponse';
import { QueryParams } from '../../actions/QueryParams';
import { ProjectRoute } from '../../routes/Routes';
import { Project } from './Project';
import { ProjectHistory } from './ProjectHistory';

export const projectHistoryGet = (
  queryParams?: QueryParams<Project>
): Promise<ProjectHistory[]> => {
  const config: QueryParams<Project> = {
    method: 'get',
    url: `${queryParams?.url || ProjectRoute()}${
      queryParams?.id ? `/${queryParams?.id}` : ''
    }`,
    params: { revision_log: true, id: undefined, ...queryParams?.params },
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ProjectHistory[]>(config)
    : getResponse<ProjectHistory[], Project>(tqApi, config);
};
