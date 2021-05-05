import { logger } from './Logger';

export const logError = (err: any) => {
  if (err.error) {
    logger.error(`Status Code ${err.statusCode}`, err.error);
  } else {
    logger.error(err);
  }
};
