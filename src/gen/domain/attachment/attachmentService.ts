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
import { AttachmentRoute } from '../../routes/Routes';
import { Attachment } from './Attachment';
import { AttachmentApi } from './AttachmentApi';

export const attachmentGetMany = (
  queryParams?: QueryParams<Attachment>
): Promise<ResourceList<AttachmentApi>> => {
  const config: QueryParams<Attachment> = {
    method: 'get',
    url: queryParams?.url || AttachmentRoute(),
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<ResourceList<AttachmentApi>>(config)
    : getResponse<ResourceList<AttachmentApi>, Attachment>(tqApi, config);
};

export const attachmentGetOne = (
  id: number,
  queryParams?: QueryParams<Attachment>
): Promise<AttachmentApi> => {
  const config: QueryParams<Attachment> = {
    method: 'get',
    url: `${queryParams?.url || AttachmentRoute()}/${id}`,
    params: queryParams?.params || {},
    cancelToken: queryParams?.cancelToken,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<AttachmentApi>(config)
    : getResponse<AttachmentApi, Attachment>(tqApi, config);
};

export const attachmentDeleteOne = (
  id: number,
  queryParams?: QueryParams<Attachment>
): Promise<MessageResponse> => {
  const config: QueryParams<Attachment> = {
    method: 'delete',
    url: `${queryParams?.url || AttachmentRoute()}/${id}`,
    params: queryParams?.params,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<MessageResponse>(config)
    : getResponse<MessageResponse, Attachment>(tqApi, config);
};

export const attachmentUpdateOne = (
  id: number,
  data: Partial<Attachment>,
  queryParams?: QueryParams<Attachment>
): Promise<Attachment> => {
  const config: QueryParams<Attachment> = {
    method: 'put',
    url: `${queryParams?.url || AttachmentRoute()}/${id}`,
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Attachment>(config)
    : getResponse<Attachment>(tqApi, config);
};

export const attachmentCreateOne = (
  data: Partial<Attachment>,
  queryParams?: QueryParams<Attachment>
): Promise<Attachment> => {
  const config: QueryParams<Attachment> = {
    method: 'post',
    url: queryParams?.url || AttachmentRoute(),
    params: queryParams?.params,
    data,
  };

  return queryParams?.batch
    ? queryParams.batch.addBatch<Attachment>(config)
    : getResponse<Attachment>(tqApi, config);
};
