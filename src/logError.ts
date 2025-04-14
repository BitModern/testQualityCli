import { logger } from './Logger';

export const logError = (err: any) => {
  console.log('logError', err);

  if (!err) return;

  if (
    // got 401, tried to refresh token, didn't find (ReturnToken.)refresh_token
    err.id === 'NO_REFRESH_TOKEN' ||
    err.code === 'NO_REFRESH_TOKEN' ||
    // got 401, tried to refresh token, refresh token request failed
    // new SDK only
    err.id === 'REFRESH_TOKEN_ERROR' ||
    err.code === 'REFRESH_TOKEN_ERROR' ||
    // got 401, tried to refresh token, refresh token request failed due to...
    // old SDK only
    err.message === 'The refresh token is invalid.' ||
    // got 401, unknown reason (simply not authorized)
    err.message === 'Unauthenticated.'
  ) {
    // TODO @david
    // There was an authentication issue, do we need more context?
    logger.error('There was an authentication issue.', err);
    return;
  }

  if (err.error) {
    logger.error(`Status Code ${err.statusCode}`, err.error);
  } else {
    logger.error(err);
  }
};
