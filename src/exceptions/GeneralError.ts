/**
 * Copyright (C) 2020 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Created by jamespitts on 4/6/20.
 */
import { HttpError } from './HttpError';

export const VERIFICATION = 1001;
export const AUTH = 1002;

export class GeneralError extends HttpError {
  constructor(
    message: string,
    public code: number,
    public statusCode?: number
  ) {
    super(message, statusCode);
  }
}
