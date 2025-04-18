import type { Arguments, Argv } from 'yargs';
import { env, saveEnv } from './env';
import { logger } from './Logger';
import {
  ClientSdk,
  getResponse,
  setGlobalClient,
  type HttpError,
  type LoggerInterface,
  projectGetMany,
  type ResourceList,
  type ReturnToken,
} from '@testquality/sdk';
import { EnvStorage } from './EnvStorage';
import { type HasId } from 'HasId';
import { logError } from './logError';

const singleClient = new ClientSdk({
  clientId: env.client_id,
  clientSecret: env.client_secret,
  baseUrl: env.api.url,
  debug: env.api.xDebug,
  errorHandler: (newError: HttpError) => {
    logError(newError);
  },
  persistentStorage: new EnvStorage(),
  logger: logger as LoggerInterface,
});

setGlobalClient(singleClient);

export class Command {
  public client: ClientSdk;
  public projectId?: number;

  constructor(
    public command: string,
    public description: string,
    public subBuilder: (args: Argv) => Argv,
    public subHandler: (args: Arguments) => void,
  ) {
    this.client = singleClient;
  }

  public builder = (args: Argv): Argv => {
    return this.subBuilder(args);
  };

  public handler = (args: Arguments): void => {
    if (args.verbose) {
      logger.info(`TestQuality Host: ${env.api.url}`);
      logger.info('Current path ' + process.cwd());
    }
    if (args.save) {
      EnvStorage.enableSave();
    }
    this.subHandler(args);
  };

  public getProjectId(args: any): Promise<number | undefined> {
    return new Promise((resolve, reject) => {
      this.reLogin(args).then(() => {
        const projectName = args.project_name as string;
        if (projectName) {
          projectGetMany().then((projectList) => {
            const project = projectList.data.find(
              (p) => p.name.toLowerCase() === projectName.toLowerCase(),
            );
            if (project) {
              this.projectId = project.id;
              if (args.save) {
                env.auth.project_id = this.projectId.toString();
                saveEnv();
              }
              resolve(this.projectId);
            } else {
              resolve(undefined);
            }
          }, reject);
        } else {
          const value = (args.project_id as string) || env.auth.project_id;
          if (value) {
            this.projectId = parseInt(value, 10);
            if (args.save) {
              env.auth.project_id = value;
              saveEnv();
            }
          }
          resolve(this.projectId);
        }
      }, reject);
    });
  }

  public async reLogin(args: any): Promise<ReturnToken | undefined> {
    this.migrateOldVariables(args);
    this.client.getAuth(); // initiate auth
    const un = (args.username as string) || env.auth.username;
    const pw = (args.password as string) || env.auth.password;
    if (un && pw) {
      return await this.client.getAuth().login(un, pw, true);
    } else {
      const at = args.access_token
        ? (args.access_token as string).trim()
        : undefined;
      const ea = args.expires_at as string;
      if (at) {
        return await this.client
          .getAuth()
          .setToken({ access_token: at, expires_at: ea } as any, true);
      }
      return undefined;
    }
  }

  public migrateOldVariables(args: any) {
    if (!args.username && !env.auth.username) {
      if (env.variables.username?.value) {
        env.auth.username = env.variables.username.value;
        env.auth.password = env.variables.password.value;
      } else if (env.variables.access_token.value) {
        env.auth.token = JSON.stringify({
          access_token: env.variables.access_token.value,
          refresh_token: env.variables.refresh_token.value,
          expires_at: env.variables.expires_at.value,
        });
      }
    }
  }

  public getParams(args: any) {
    let params: any = {};
    if (args.params) {
      if (Array.isArray(args.params as string[])) {
        for (const param of args.params as string[]) {
          const parts = param.split('=');
          if (parts.length > 1) {
            params[parts[0]] = parts[1];
          }
        }
      } else {
        params = { ...args.params };
      }
    }
    return params;
  }

  public async getId(
    args: any,
    type: string,
    projectId?: number,
    required: boolean = true,
  ): Promise<number | undefined> {
    const id = args[type + '_id'];
    if (id) {
      return parseInt(id, 10);
    }

    const name = args[type + '_name'] as string;
    if (!name) {
      if (required) {
        throw new Error(
          `${type}_name is required. Try adding "--${type}_name=<name>" or "--${type}_id=<number>"`,
        );
      }
      return undefined;
    }
    if (!projectId) {
      throw new Error(
        `projectId is required. Try adding "--project_name=<name>" or "--project_id=<number>"`,
      );
    }
    const list = await getResponse<ResourceList<HasId>>(this.client.api, {
      method: 'get',
      url: `/${type}`,
      params: {
        project_id: projectId,
        name,
      } as any,
    });
    const item = list.data.find(
      (p) => p.name.toLowerCase() === name.toLowerCase(),
    );
    if (!item) {
      throw new Error(`${type} ${name} not found!`);
    }
    return item.id;
  }
}
