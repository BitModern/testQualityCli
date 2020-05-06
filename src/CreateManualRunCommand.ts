import { Command } from './Command';
import { logError } from './error';
import { Arguments, Argv } from 'yargs';
import { tqRequest, tqPost } from './tqRequest';
import { IResourceList } from './ResourceList';

interface IHasId {
  id: number;
  name: string;
}

export class CreateManualRunCommand extends Command {
  constructor() {
    super(
      'create_manual_run',
      'Create a Plan Test Run for manual execution without uploading test results',
      (args: Argv) => {
        return args.option('run_name', {
          describe: `Plan Test Run name, example: create_manual_run --run_name 'My_Manual_Run'`,
          type: 'string'
        });
      },
      (args: Arguments) => {
        this.auth.update(args).then(accessToken => {
          this.getId(args, 'plan', accessToken).then(
            planId => {
              this.getId(args, 'milestone', accessToken, false).then(
                milestoneId => {
                  if (planId) {
                    this.createManualRun(
                      args,
                      accessToken,
                      planId,
                      milestoneId
                    ).then(
                      (response: any) => console.log(response),
                      (error: any) => logError(error)
                    );
                  }
                },
                (error: any) => logError(error)
              );
            },
            (error: any) => logError(error)
          );
        });
      }
    );
  }

  private getId(
    args: any,
    type: string,
    accessToken: string,
    required: boolean = true
  ): Promise<number | undefined> {
    return new Promise((resolve, reject) => {
      const name = args[type + '_name'] as string;

      if (!this.auth.projectId) {
        reject(
          `projectId is required. Try adding "--project_name=<name>" or "--project_id=<number>"`
        );
      }

      if (name) {
        tqRequest<IResourceList<IHasId>>(
          accessToken,
          `/${type}?project_id=${this.auth.projectId}`
        ).then(list => {
          const item = list.data.find(
            p => p.name.toLowerCase() === name.toLowerCase()
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

  private createManualRun(
    args: Arguments,
    accessToken: string,
    planId: number | undefined,
    milestoneId: number | undefined
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const formData: any = {
        is_complete: 0,
        is_running: 1,
        plan_id: planId,
        project_id: this.auth.projectId,
        start_time: new Date().toISOString()
      };

      if (args.run_name) {
        formData.name = args.run_name;
      }

      if (milestoneId) {
        formData.milenstone_id = milestoneId;
      }

      // console.log(formData);
      return tqPost<any>(accessToken, '/run', formData).then((body: any) => {
        const response = {
          id: body.id,
          name: body.name,
          start_time: body.start_time,
          is_complete: body.is_complete,
          is_running: body.is_running,
          project_id: body.project_id,
          plan_id: body.plan_id,
          milenstone_id: body.milenstone_id,
          run_result_rows: body.run_result_rows
        };
        resolve(response);
      }, reject);
    });
  }
}
