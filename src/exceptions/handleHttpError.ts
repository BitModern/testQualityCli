import { AxiosResponse } from 'axios';
import { notification } from 'src/components/bit-ui';
import { HttpError } from './HttpError';
import { ConsoleLogger } from '../common/ConsoleLogger';

const log = new ConsoleLogger('handleHttpError');

export const UNKOWN_ERROR = 'UNKNOWN_ERROR';
export const VALIDATION_ERROR = 'VALIDATION_ERROR';
export const EMAIL_VERIFICATION_ERROR = 'EMAIL_VERIFICATION_ERROR';
export const EXPIRED_USER_EXCEPTION = 'EXPIRED_USER_EXCEPTION';
export const CHANGE_PASSWORD_FAILURE_EXCEPTION =
  'CHANGE_PASSWORD_FAILURE_EXCEPTION';
export const CLIENT_ID_INMUTABLE_EXCEPTION = 'CLIENT_ID_INMUTABLE_EXCEPTION';
export const CREATED_BY_INMUTABLE_EXCEPTION = 'CREATED_BY_INMUTABLE_EXCEPTION';
export const GITHUB_PURCHASE_ALREADY_ALLOCATED_EXCEPTION =
  'GITHUB_PURCHASE_ALREADY_ALLOCATED_EXCEPTION';
export const INTEGRATION_AUTH_EXCEPTION = 'INTEGRATION_AUTH_EXCEPTION';
export const INTEGRATION_EXCEPTION = 'INTEGRATION_EXCEPTION';
export const INTEGRATION_JIRA_EXCEPTION = 'INTEGRATION_JIRA_EXCEPTION';
export const INVALID_TOKEN_EXCEPTION = 'INVALID_TOKEN_EXCEPTION';
export const MAIL_CHIMP_EXCEPTION = 'MAIL_CHIMP_EXCEPTION';
export const NO_TOKEN_EXCEPTION = 'NO_TOKEN_EXCEPTION';
export const PASSWORD_STRENGTH_EXCEPTION = 'PASSWORD_STRENGTH_EXCEPTION';
export const PRIMARY_KEY_VIOLATION_EXCEPTION =
  'PRIMARY_KEY_VIOLATION_EXCEPTION';
export const RESOURCE_STORE_FAILED_EXCEPTION =
  'RESOURCE_STORE_FAILED_EXCEPTION';
export const RUN_CREATE_EXCEPTION = 'RUN_CREATE_EXCEPTION';
export const UPDATE_EXCEPTION = 'UPDATE_EXCEPTION';
export const USER_CREATE_EXCEPTION = 'USER_CREATE_EXCEPTION';
export const USER_NOT_AUTHORIZED_EXCEPTION = 'USER_NOT_AUTHORIZED_EXCEPTION';
export const USER_NOT_FOUND_EXCEPTION = 'USER_NOT_FOUND_EXCEPTION';
export const VALIDATION_FAILED_EXCEPTION = 'VALIDATION_FAILED_EXCEPTION';

export function getHttpResponse(response: AxiosResponse) {
  if (response.status === -1) {
    if (response.data === null) {
      return new HttpError(
        'Oops, Could not obtain data from server due to network problem.',
        UNKOWN_ERROR,
        'Network Error',
        500,
      );
    }
  } else if (response.status === 400 && response.data?.validation_errors) {
    return new HttpError(
      getMessage(response),
      VALIDATION_ERROR,
      response.data.validation_errors,
      response.status,
      response.data.code,
      response.data.trace,
    );
  }
  return new HttpError(
    getMessage(response),
    response?.data?.id,
    response?.data?.title,
    response.status,
    response.data.code,
    response.data.trace,
  );
}

export function showNotificationError(newError: HttpError) {
  log.error(
    newError.stack ? newError.stack : newError.message,
    newError.title,
    newError.status,
    newError.code,
    newError.trace,
  );
  notification.open({
    type: 'error',
    message: newError.title ? newError.title : 'Error',
    description: newError.message,
  });
}

function getMessage(error: any) {
  let message: string;
  if (error) {
    if (error.exception && !error.data) {
      error.data = error.exception;
    }
    if (error.status === 404) {
      message = 'Resource Not Found.';
    } else if (error.status === -1 && error.data === null) {
      message =
        'Oops, Could not obtain data from server due to network problem.';
    } else if (error.data?.code === '23505') {
      // duplicate
      error.data.title = 'Duplicate';
      message = 'Name already exists, try a different name.';
    } else if (
      error.data &&
      error.data.validation_errors &&
      error.data.validation_errors.email
    ) {
      if (Array.isArray(error.data.validation_errors.email)) {
        message = error.data.validation_errors.email.join(', \n');
      } else {
        message = error.data.validation_errors.email;
      }
    } else if (error.data && error.data.message) {
      message = error.data.message;
    } else if (error.data && error.data.error) {
      message = error.data.error;
    } else if (error.data && error.data.detail) {
      message = error.data.detail;
    } else if (error.statusText) {
      message = error.statusText;
    } else if (error.message) {
      message = error.message;
    } else if (error.status === 401) {
      message = 'Failed to authenticate.';
    } else {
      message = 'Something went wrong';
    }
  } else {
    message = 'Trouble communicating with server, please try again later.';
  }
  return message;
}
