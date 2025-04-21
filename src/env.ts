import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { boolean, object, string, type InferType } from 'yup';

import Debug from 'debug';
const debug = Debug('tq:cli:env');

const schema = object({
  api: object({
    url: string().default('https://api.testquality.com'),
    xDebug: boolean().default(false),
  }).default({}),
  auth: object({
    // both properties are stringified in EnvStorage
    remember: string(),
    token: string(),
  }).default({}),
  clientId: string().default('2'),
  clientSecret: string().default('93MBS86X7JrK4Mrr1mk4PKfo6b1zRVx9Mrmx0nTa'),
  log: object({
    data: boolean().default(true),
    format: string().default('short'),
    level: string().default('info'),
    levelInString: boolean().default(true),
  }),
  variables: object({
    accessToken: string(),
    expiresAt: string(),
    password: string(),
    projectId: string(),
    refreshToken: string(),
    username: string(),
  }).default({}),
});

export type SchemaType = InferType<typeof schema>;

const envVars = [
  'APP_XDEBUG',
  'LOG_LEVEL',
  'LOG_LEVEL_IN_STRING',
  'LOG_FORMAT',
  'LOG_DATA',
  'TQ_ACCESS_TOKEN',
  'TQ_CLIENT_SECRET',
  'TQ_CLIENT_ID',
  'TQ_EXPIRES_AT',
  'TQ_HOST',
  'TQ_PASSWORD',
  'TQ_PROJECT_ID',
  'TQ_REFRESH_TOKEN',
  'TQ_REMEMBER',
  'TQ_TOKEN',
  'TQ_USERNAME',
] as const;

export type DotEnvParsed = Partial<Record<(typeof envVars)[number], string>>;

const envFilePath = path.resolve(process.cwd(), '.testquality');

const readDotEnv = (envPath: string = envFilePath): DotEnvParsed => {
  debug('readDotEnv', envPath);
  if (fs.existsSync(envPath)) {
    const envFile = dotenv.config({ path: envPath });
    // @ts-expect-error envFile.error has code property
    if (envFile.error && envFile.error.code !== 'ENOENT') {
      console.error(envFile.error);
    } else {
      debug('readDotEnv.parsed %j', envFile.parsed);
    }
  }

  const parsed = envVars.reduce<DotEnvParsed>((acc, key) => {
    acc[key] = process.env[key];
    return acc;
  }, {});
  debug('readDotEnv.dotEnvParsed %j', parsed);
  return parsed;
};

const writeDotEnv = (
  dotEnvParsedUpdated: DotEnvParsed = {},
  envPath: string = envFilePath,
) => {
  debug('writeDotEnv %j', { dotEnvParsedUpdated, envPath });
  const content = Object.entries({
    ...readDotEnv(envPath),
    ...dotEnvParsedUpdated,
  })
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`);

  debug('writeDotEnv %j', { content });
  if (content.length > 0) {
    fs.writeFileSync(envPath, content.join('\n'), {
      encoding: 'utf-8',
      flag: 'w',
    });
  }
};

const dotEnvToEnv = (dotEnvParsed: DotEnvParsed): SchemaType => {
  return schema.validateSync({
    api: {
      url: dotEnvParsed.TQ_HOST,
      xDebug: dotEnvParsed.APP_XDEBUG,
    },
    auth: {
      remember: dotEnvParsed.TQ_REMEMBER,
      token: dotEnvParsed.TQ_TOKEN,
    },
    clientId: dotEnvParsed.TQ_CLIENT_ID,
    clientSecret: dotEnvParsed.TQ_CLIENT_SECRET,
    log: {
      data: dotEnvParsed.LOG_DATA,
      format: dotEnvParsed.LOG_FORMAT,
      level: dotEnvParsed.LOG_LEVEL,
      levelInString: dotEnvParsed.LOG_LEVEL_IN_STRING,
    },
    variables: {
      accessToken: dotEnvParsed.TQ_ACCESS_TOKEN,
      expiresAt: dotEnvParsed.TQ_EXPIRES_AT,
      password: dotEnvParsed.TQ_PASSWORD,
      projectId: dotEnvParsed.TQ_PROJECT_ID,
      refreshToken: dotEnvParsed.TQ_REFRESH_TOKEN,
      username: dotEnvParsed.TQ_USERNAME,
    },
  });
};

const envToDotEnv = (env: SchemaType): DotEnvParsed => {
  return {
    APP_XDEBUG: env.api.xDebug.toString(),
    LOG_DATA: env.log.data.toString(),
    LOG_FORMAT: env.log.format,
    LOG_LEVEL: env.log.level,
    LOG_LEVEL_IN_STRING: env.log.levelInString.toString(),
    TQ_ACCESS_TOKEN: env.variables.accessToken,
    TQ_CLIENT_ID: env.clientId,
    TQ_CLIENT_SECRET: env.clientSecret,
    TQ_EXPIRES_AT: env.variables.expiresAt,
    TQ_HOST: env.api.url,
    TQ_PASSWORD: env.variables.password,
    TQ_PROJECT_ID: env.variables.projectId,
    TQ_REFRESH_TOKEN: env.variables.refreshToken,
    TQ_REMEMBER: env.auth.remember,
    TQ_TOKEN: env.auth.token,
    TQ_USERNAME: env.variables.username,
  };
};

export const env = dotEnvToEnv(readDotEnv());

export const saveEnv = () => {
  writeDotEnv(envToDotEnv(env));
};
