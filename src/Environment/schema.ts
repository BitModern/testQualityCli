import {
  boolean,
  object,
  string,
  InferType,
} from 'yup';

export const schema = object({
  api: object({
        url: string().default('https://api.testquality.com').meta({ env: 'TQ_HOST' }),
        xDebug: boolean().default(false).meta({ env: 'APP_XDEBUG' }),
      }).default({}),
  auth: object({
        remember: boolean().meta({ env: 'TQ_REMEMBER' }),
        token: string().meta({ env: 'TQ_TOKEN' }),
      }),
      clientId: string().default('2').meta({ env: 'TQ_CLIENT_ID' }),
      clientSecret: string().default('93MBS86X7JrK4Mrr1mk4PKfo6b1zRVx9Mrmx0nTa').meta({ env: 'TQ_CLIENT_SECRET' }),
      log: object({
        level: string().default('info').meta({ env: 'TQ_LOG_LEVEL' }),
        levelInString: boolean().default(true).meta({ env: 'TQ_LOG_LEVEL_IN_STRING' }),
        format: string().default('short').meta({ env: 'TQ_LOG_FORMAT' }),
        data: boolean().default(true).meta({ env: 'TQ_LOG_DATA' }),
      }),
      variables: object({
        accessToken: string().meta({ env: 'TQ_ACCESS_TOKEN' }),
        expiresAt: string().meta({ env: 'TQ_EXPIRES_AT' }),
        password: string().meta({ env: 'TQ_PASSWORD' }),
        projectId: string().meta({ env: 'TQ_PROJECT_ID' }),
        refreshToken: string().meta({ env: 'TQ_REFRESH_TOKEN' }),
        username: string().meta({ env: 'TQ_USERNAME' }),
      }).default({}),
    });

// Define the environment type based on schema
export type SchemaType = InferType<typeof schema>;
