/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { tqApi } from 'src/services/http/tqApi';
import { getResponse } from '../../actions/getResponse';
import { QueryParams } from '../../actions/QueryParams';
import { MessageResponse } from '../../actions/MessageResponse';
import { ResourceList } from '../../models/ResourceList';
import { CommentRoute } from '../../routes/Routes';
import { Comment } from './Comment';
import { CommentApi } from './CommentApi';

export const commentGetMany = (
  queryParams?: QueryParams<Comment>
): Promise<ResourceList<CommentApi>> => {
  const config: QueryParams<Comment> = {
    method: 'get',
    url: queryParams?.url || CommentRoute(),
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<CommentApi>>(config)
    : getResponse<ResourceList<CommentApi>, Comment>(tqApi, config);
};

export const commentGetOne = (
  id: number,
  queryParams?: QueryParams<Comment>
): Promise<CommentApi> => {
  const config: QueryParams<Comment> = {
    method: 'get',
    url: `${queryParams?.url || CommentRoute()}/${id}`,
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<CommentApi>(config)
    : getResponse<CommentApi, Comment>(tqApi, config);
};

export const commentDeleteOne = (
  id: number,
  queryParams?: QueryParams<Comment>
): Promise<MessageResponse> => {
  const config: QueryParams<Comment> = {
    method: 'delete',
    url: `${queryParams?.url || CommentRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, Comment>(tqApi, config);
};

export const commentUpdateOne = (
  id: number,
  data: Partial<Comment>,
  queryParams?: QueryParams<Comment>
): Promise<Comment> => {
  const config: QueryParams<Comment> = {
    method: 'put',
    url: `${queryParams?.url || CommentRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Comment>(config)
    : getResponse<Comment>(tqApi, config);
};

export const commentCreateOne = (
  data: Partial<Comment>,
  queryParams?: QueryParams<Comment>
): Promise<Comment> => {
  const config: QueryParams<Comment> = {
    method: 'post',
    url: queryParams?.url || CommentRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Comment>(config)
    : getResponse<Comment>(tqApi, config);
};
