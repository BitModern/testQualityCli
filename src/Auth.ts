import * as request from 'request-promise-native';
import { env, saveEnv } from './env';
import { IReturnToken } from './ReturnToken';
import { tqRequest } from './tqRequest';
import { IResourceList } from './ResourceList';
import { IProjectResource } from './ProjectCommand';

export class Auth {
  public accessToken?: string;
  public refreshToken?: string;
  public expiresAt?: number;
  public projectId?: string;

  public login(
    username: string | unknown,
    password: string | unknown
  ): Promise<IReturnToken> {
    return new Promise((resolve, reject) => {
      const url = `${env.host}/oauth/access_token`;
      const options = {
        method: 'POST',
        url,
        headers: {
          'content-type': 'application/json'
        },
        body: {
          grant_type: 'password',
          client_id: env.client_id,
          client_secret: env.client_secret,
          username,
          password
        },
        json: true // Automatically parses the JSON string in the response
      };
      return request(options).then((body: IReturnToken) => {
        this.handleReturnToken(body);
        resolve(body);
      }, reject);
    });
  }

  public refresh(refreshToken: string): Promise<IReturnToken> {
    return new Promise((resolve, reject) => {
      if (!refreshToken) {
        return reject(new Error('No refresh toke supplied'));
      }
      const url = `${env.host}/oauth/access_token`;
      const options = {
        method: 'POST',
        url,
        headers: {
          'content-type': 'application/json'
        },
        body: {
          grant_type: 'refresh_token',
          client_id: env.client_id,
          client_secret: env.client_secret,
          refresh_token: refreshToken
        },
        json: true // Automatically parses the JSON string in the response
      };
      return request(options).then((body: IReturnToken) => {
        this.handleReturnToken(body);
        resolve(body);
      }, reject);
    });
  }

  public updateTokenVars() {
    env.variables.access_token.value = this.accessToken;
    env.variables.refresh_token.value = this.refreshToken;
    env.variables.expires_at.value = this.expiresAt
      ? this.expiresAt.toString()
      : undefined;
  }

  public update(args: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const projectName = args.project_name as string;
      if (projectName) {
        this.updateToken(args).then(accessToken => {
          tqRequest<IResourceList<IProjectResource>>(
            accessToken,
            '/project'
          ).then(projectList => {
            const project = projectList.data.find(
              p => p.name.toLowerCase() === projectName.toLowerCase()
            );
            if (project) {
              this.projectId = project.id.toString();
              if (args.save) {
                env.variables.project_id.value = this.projectId;
                saveEnv();
              }
              resolve(accessToken);
            } else {
              reject(`Project ${projectName} not found!`);
            }
          }, reject);
        }, reject);
      } else {
        this.projectId =
          (args.project_id as string) || env.variables.project_id.value;
        this.updateToken(args).then(resolve, reject);
      }
    });
  }

  private updateToken(args: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const un = (args.username as string) || env.variables.username.value;
      const pw = (args.password as string) || env.variables.password.value;
      const at =
        (args.access_token as string) || env.variables.access_token.value;
      const ea = (args.expires_at as string) || env.variables.expires_at.value;
      const rt =
        (args.refresh_token as string) || env.variables.refresh_token.value;
      if (un && pw) {
        this.login(un, pw).then(body => {
          if (args.save) {
            saveEnv();
          }
          resolve(body.access_token);
        }, reject);
      } else {
        if (at && ea) {
          if (parseInt(ea, 10) < new Date().getTime()) {
            this.refresh(rt as string).then(body => {
              if (args.save) {
                saveEnv();
              }
              resolve(body.access_token);
            }, reject);
          } else {
            this.refreshToken = rt;
            this.accessToken = at;
            this.expiresAt = parseInt(ea, 10);
            this.updateTokenVars();
            resolve(this.accessToken);
          }
        } else {
          reject(new Error('No authentication parameters supplied.'));
        }
      }
    });
  }

  private handleReturnToken = (body: IReturnToken) => {
    this.accessToken = body.access_token;
    this.refreshToken = body.refresh_token;
    this.expiresAt = new Date().getTime() + body.expires_in * 1000;
    this.updateTokenVars();
  };
}
