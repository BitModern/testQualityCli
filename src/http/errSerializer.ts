/**
 * Copyright (C) 2020 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Created by jamespitts on 3/30/20.
 */
import { AxiosError } from 'axios';
import * as Logger from 'bunyan';

export interface TraceFile {
  file: string;
  line: number;
  function: string;
  class: string;
  type: string;
  args: any[];
}

export interface LaravelException {
  exception_class: string;
  message: string;
  code: string;
  trace: TraceFile[];
}

export interface ServerError {
  message: string;
  name: string;
  stack: string;
  signal: string;
  code?: string;
  exception?: string;
  trace?: string;
  statusCode?: number;
}

export const errSerializer = (
  err: AxiosError<LaravelException>
): ServerError => {
  if (err.response && err.response.data) {
    const serverError = Logger.stdSerializers.err(err);
    if (err.response.status) {
      serverError.statusCode = err.response.status;
    }
    const data = err.response.data;
    if (data) {
      const trace = data.trace
        ?.map((cur: any) => {
          const params = cur.args
            .map((cur2: any) => {
              return JSON.stringify(cur2);
            })
            .join(',');
          const rtn =
            `${cur.file}:${cur.line} - ` +
            (cur.class ? `${cur.class}` : '') +
            (cur.type ? `${cur.type}` : '') +
            (cur.function ? `${cur.function}` : '') +
            `(${params})`;
          return rtn;
        })
        .join('\n');
      const message = JSON.stringify(data.message);
      serverError.orgMessage = serverError.message;
      serverError.message = `${serverError.message}\n${message}\nException: ${data.exception_class}\n${trace}`;
      serverError.code = data.code ? data.code : serverError.code;
      serverError.exception = data.exception_class;
      serverError.trace = trace;
    }
    return serverError;
  }
  return Logger.stdSerializers.err(err);
};
