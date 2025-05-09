import { logger } from './Logger';

export const logError = (err: any) => {
  if (!err) return;

  if (
    // got 401, tried to refresh token, didn't find (ReturnToken.)refresh_token
    err.id === 'NO_REFRESH_TOKEN' ||
    err.code === 'NO_REFRESH_TOKEN' ||
    // got 401, tried to refresh token, refresh token request failed
    // new SDK only
    err.id === 'REFRESH_TOKEN_ERROR' ||
    err.code === 'REFRESH_TOKEN_ERROR' ||
    // got 401, unknown reason (simply not authorized)
    err.message === 'Unauthenticated.'
  ) {
    logger.error(
      'There was an authentication issue. Please try logging in again or using valid credentials.',
      err,
    );
    return;
  }

  if (err.error) {
    logger.error(`Status Code ${err.statusCode}`, err.error);
  } else {
    logger.error(err);
  }
};
