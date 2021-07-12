import { Arguments, Argv } from 'yargs';
import { env, saveEnv } from './env';
import { logger } from './Logger';
import {
  Client,
  getResponse,
  HttpError,
  LoggerInterface,
  projectGetMany,
  ResourceList,
  ReturnToken,
} from '@testquality/sdk';
import { EnvStorage } from './EnvStorage';
import { HasId } from 'HasId';
import { logError } from './logError';

const singleClient = new Client({
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

export class Command {
  public client: Client;
  public projectId?: number;

  constructor(
    public command: string,
    public description: string,
    public subBuilder: (args: Argv) => Argv,
    public subHandler: (args: Arguments) => void
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
    this.subHandler(args);
  };
  public getProjectId(args: any): Promise<number | undefined> {
    return new Promise((resolve, reject) => {
      this.reLogin(args).then(() => {
        const projectName = args.project_name as string;
        if (projectName) {
          projectGetMany().then((projectList) => {
            const project = projectList.data.find(
              (p) => p.name.toLowerCase() === projectName.toLowerCase()
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
  public reLogin(args: any): Promise<ReturnToken | undefined> {
    this.migrateOldVariables(args);
    this.client.getAuth(); // initiate auth
    return new Promise((resolve, reject) => {
      const un = (args.username as string) || env.auth.username;
      const pw = (args.password as string) || env.auth.password;
      if (un && pw) {
        this.client.getAuth().login(un, pw).then(resolve, reject);
      } else {
        resolve(undefined);
      }
    });
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
        params = { ...(args.params as any) };
      }
    }
    return params;
  }

  public getId(
    args: any,
    type: string,
    projectId?: number,
    required: boolean = true
  ): Promise<number | undefined> {
    return new Promise((resolve, reject) => {
      const name = args[type + '_name'] as string;
      if (!projectId) {
        reject(
          `projectId is required. Try adding "--project_name=<name>" or "--project_id=<number>"`
        );
      }

      if (name) {
        getResponse<ResourceList<HasId>>(this.client.api, {
          method: 'get',
          url: `/${type}`,
          params: {
            project_id: projectId,
          } as any,
        }).then((list) => {
          const item = list.data.find(
            (p) => p.name.toLowerCase() === name.toLowerCase()
          );
          if (item) {
            resolve(item.id);
          } else {
            reject(`${type} ${name} not found!`);
          }
        }, reject);
      } else {
        const id = args[type + '_id'];
        if (id) {
          resolve(parseInt(id, 10));
        } else if (required) {
          reject(
            `${type} is required. Try adding "--${type}_name=<name>" or "--${type}_id=<number>"`
          );
        } else {
          resolve(undefined);
        }
      }
    });
  }
}
