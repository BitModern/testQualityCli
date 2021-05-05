import { env, saveEnv } from './env';
import { tqRequest } from './tqRequest';
import { Auth } from './auth/Auth';
import { ReturnToken } from './auth/ReturnToken';
import { ProjectApi } from './gen/domain/project/ProjectApi';
import { ResourceList } from './gen/models/ResourceList';

export class UpdateAuth extends Auth {
  public projectId?: string;

  public updateTokenVars() {
    const token = this.getToken();
    if (token) {
      env.variables.access_token.value = token.access_token;
      env.variables.refresh_token.value = token.refresh_token;
      env.variables.expires_at.value = token.expires_at
        ? token.expires_at.toString()
        : undefined;
    }
  }

  public updateToken(token?: ReturnToken): ReturnToken | undefined {
    if (token && token.expires_in) {
      token.expires_at = (new Date().getTime() + token.expires_in * 1000).toString();
    }
    const rtn = super.updateToken(token);
    if (token) {
      this.updateTokenVars();
    }
    return rtn;
  }

  public update(args: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const projectName = args.project_name as string;
      if (projectName) {
        this.updateEnvToken(args).then((accessToken) => {
          tqRequest<ResourceList<ProjectApi>>('/project').then(
            (projectList) => {
              const project = projectList.data.find(
                (p) => p.name.toLowerCase() === projectName.toLowerCase()
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
            },
            reject
          );
        }, reject);
      } else {
        this.projectId =
          (args.project_id as string) || env.variables.project_id.value;
        this.updateEnvToken(args).then(resolve, reject);
      }
    });
  }

  private updateEnvToken(args: any): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      const un = (args.username as string) || env.variables.username.value;
      const pw = (args.password as string) || env.variables.password.value;
      const at =
        (args.access_token as string) || env.variables.access_token.value;
      const ea = (args.expires_at as string) || env.variables.expires_at.value;
      const rt =
        (args.refresh_token as string) || env.variables.refresh_token.value;
      if (un && pw) {
        this.login(un, pw).then((body) => {
          if (args.save) {
            saveEnv();
          }
          resolve(body?.access_token);
        }, reject);
      } else {
        if (at && ea) {
          if (parseInt(ea, 10) < new Date().getTime()) {
            this.refresh(rt as string).then((body) => {
              if (args.save) {
                saveEnv();
              }
              resolve(body?.access_token);
            }, reject);
          } else {
            this.updateToken({
              refresh_token: rt,
              access_token: at,
              expires_at: ea,
            } as any);
            this.addInterceptors();
            resolve(at);
          }
        } else {
          reject(new Error('No authentication parameters supplied.'));
        }
      }
    });
  }
}
