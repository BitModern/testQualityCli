import { runCreateOne } from '@testquality/sdk';
import { Command } from './Command';
import { logError } from './logError';
import { Arguments, Argv } from 'yargs';

export class CreateManualRunCommand extends Command {
  constructor() {
    super(
      'create_manual_run',
      'Create a Plan Test Run for manual execution without uploading test results',
      (args: Argv) => {
        return args.option('run_name', {
          describe: `Plan Test Run name, example: create_manual_run --run_name 'My_Manual_Run'`,
          type: 'string',
        });
      },
      (args: Arguments) => {
        this.getProjectId(args).then((projectId) => {
          this.getId(args, 'plan', projectId).then(
            (planId) => {
              this.getId(args, 'milestone', projectId, false).then(
                (milestoneId) => {
                  if (planId) {
                    this.createManualRun(args, planId, milestoneId).then(
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

  private createManualRun(
    args: Arguments,
    planId: number | undefined,
    milestoneId: number | undefined
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const formData: any = {
        is_complete: 0,
        is_running: 1,
        plan_id: planId,
        project_id: this.projectId,
        start_time: new Date().toISOString(),
        name: args.run_name as string,
        milestone_id: milestoneId,
      };

      // console.log(formData);
      return runCreateOne(formData).then((body: any) => {
        const response = {
          id: body.id,
          name: body.name,
          start_time: body.start_time,
          is_complete: body.is_complete,
          is_running: body.is_running,
          project_id: body.project_id,
          plan_id: body.plan_id,
          milestone_id: body.milestone_id,
          run_result_rows: body.run_result_rows,
        };
        resolve(response);
      }, reject);
    });
  }
}
