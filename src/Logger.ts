/**
 * Copyright (C) 2020 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Created by jamespitts on 1/24/20.
 */
import Logger from 'bunyan';
import { env } from './env';
import { errSerializer } from './errSerializer';
const BunyanFormat = require('bunyan-format');

export const logger = new Logger({
  level: env.log.level as Logger.LogLevelString,
  name: 'cli',
  stream: BunyanFormat({
    color: true,
    levelInString: env.log.levelInString,
    outputMode: env.log.format as
      | 'short'
      | 'long'
      | 'simple'
      | 'json'
      | 'bunyan',
  }),
  serializers: {
    err: errSerializer,
    req: Logger.stdSerializers.req,
    res: Logger.stdSerializers.res,
  },
});
