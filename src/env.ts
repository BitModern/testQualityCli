import * as dotenv from 'dotenv';
// import { logError } from './error';
import * as fs from 'fs';
import * as path from 'path';

// const envFile =
dotenv.config({ path: path.join(process.cwd(), '.env') });

// if (envFile.error) {
//   logError(envFile.error);
// }

export function getOsEnv(key: string): string | undefined {
  if (process.env[key]) {
    return process.env[key] as string;
  }
  return undefined;
}

class EnvVar {
  public value?: string;
  constructor(public name: string) {
    this.value = getOsEnv(name);
  }
}

export const env = {
  host: getOsEnv('TQ_HOST') || 'https://api.testquality.com/api',
  client_id: 2,
  client_secret: '93MBS86X7JrK4Mrr1mk4PKfo6b1zRVx9Mrmx0nTa',
  variables: {
    username: new EnvVar('TQ_USERNAME'),
    password: new EnvVar('TQ_PASSWORD'),
    expires_at: new EnvVar('TQ_EXPIRES_AT'),
    access_token: new EnvVar('TQ_ACCESS_TOKEN'),
    refresh_token: new EnvVar('TQ_REFRESH_TOKEN'),
    project_id: new EnvVar('TQ_PROJECT_ID')
  }
};

export const saveEnv = () => {
  let content =
    Object.entries(env.variables).reduce(
      // tslint:disable-next-line
      (acc, [_key, value]) => {
        if (value.value && value.value !== '') {
          return `${acc}\n${value.name}=${value.value}`;
        }
        return acc;
      },
      ''
    ) + '\n';
  if (env.host !== 'https://api.testquality.com/api') {
    content += `TQ_HOST=${env.host}\n`;
  }
  fs.writeFileSync('.env', content, { encoding: 'UTF-8', flag: 'w' });
};
