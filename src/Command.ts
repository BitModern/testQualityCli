import { Arguments, Argv } from 'yargs';
import { logger } from './Logger';
import {
  ClientSdk,
  getResponse,
  setGlobalClient,
  HttpError,
  LoggerInterface,
  projectGetMany,
  ResourceList,
  ReturnToken,
} from '@testquality/sdk';
import { EnvironmentStorage, env, saveEnv } from './Environment';
import { HasId } from 'HasId';
import { logError } from './logError';

const singleClient = new ClientSdk({
  clientId: env.clientId,
  clientSecret: env.clientSecret,
  baseUrl: env.api.url,
  debug: env.api.xDebug,
  errorHandler: (newError: HttpError) => {
    logError(newError);
  },
  persistentStorage: new EnvironmentStorage(),
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
    if (args.save) {
      EnvironmentStorage.enableSave();
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
                env.variables.projectId = this.projectId.toString();
                saveEnv();
              }
              resolve(this.projectId);
            } else {
              resolve(undefined);
            }
          }, reject);
        } else {
          const value = (args.project_id as string) || env.variables.projectId;
          if (value) {
            this.projectId = parseInt(value, 10);
            if (args.save) {
              env.variables.projectId = value;
              saveEnv();
            }
          }
          resolve(this.projectId);
        }
      }, reject);
    });
  }

  public reLogin(args: any): Promise<ReturnToken | undefined> {
    return new Promise((resolve, reject) => {
      const user = (args.username as string) || env.variables.username;
      const password = (args.password as string) || env.variables.password;

      if (user && password) {
        this.client
          .getAuth()
          .login(user, password, !!args.save)
          .then(resolve, reject);
      } else {
        const accessToken =
          (args.access_token as string) || env.variables.accessToken;
        const expiresAt =
          (args.expires_at as string) || env.variables.expiresAt;
        const refreshToken =
          (args.refresh_token as string) || env.variables.refreshToken;

        // In the unlikely case that we end up with both a PAT token and a token set in ClientSdk.Auth,
        // we prioritize the PAT token.
        let token: ReturnToken | undefined;
        if (accessToken) {
          token = {
            access_token: accessToken,
            expires_at: expiresAt,
            refresh_token: refreshToken,
          };
        } else if (env.auth.token) {
          try {
            token = JSON.parse(env.auth.token);
          } catch (error) {
            logger.warn('Error parsing token from env.auth.token');
            reject(error);
          }
        }

        if (token) {
          this.client.getAuth().setToken(token, !!args.save);
        }
        resolve(undefined);
      }
    });
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

  public async getId(
    args: any,
    type: string,
    projectId?: number,
    required: boolean = true
  ): Promise<number | undefined> {
    const id = args[type + '_id'];
    if (id) {
      return parseInt(id, 10);
    }

    const name = args[type + '_name'] as string;
    if (name) {
      if (!projectId) {
        return Promise.reject(
          `projectId is required. Try adding "--project_name=<name>" or "--project_id=<number>"`
        );
      }
      return getResponse<ResourceList<HasId>>(this.client.api, {
        method: 'get',
        url: `/${type}`,
        params: {
          project_id: projectId,
        } as any,
      }).then((list) => {
        const item = list.data.find(
          (p) => p.name.toLowerCase() === name.toLowerCase()
        );
        if (!item) {
          return Promise.reject(`${type} ${name} not found!`);
        }
        return item.id;
      });
    }

    if (required) {
      return Promise.reject(
        `${type} is required. Try adding "--${type}_name=<name>" or "--${type}_id=<number>"`
      );
    }
    return;
  }
}
