import { type Run, runCreateOne } from '@testquality/sdk';
import { Command } from './Command';
import { logError } from './logError';
import { type Arguments, type Argv } from 'yargs';

interface CreateManualRunCommandArgs {
  run_name?: string;
  milestone_id?: string;
  milestone_name?: string;
  plan_id?: string;
  plan_name?: string;
}

export class CreateManualRunCommand extends Command {
  constructor() {
    super(
      'create_manual_run',
      'Create a Plan Test Run for manual execution without uploading test results',
      (args: Argv) => {
        return args
          .option('milestone_id', {
            alias: 'mi',
            describe: 'Milestone ID',
            type: 'string',
          })
          .option('milestone_name', {
            alias: 'mn',
            describe: 'Milestone Name',
            type: 'string',
          })
          .option('plan_id', {
            alias: 'pi',
            describe: 'Plan ID',
            type: 'string',
          })
          .option('plan_name', {
            alias: 'pn',
            describe: 'Plan Name',
            type: 'string',
          })
          .option('run_name', {
            alias: 'rn',
            describe: `Test Run name, example: create_manual_run --run_name 'My_Manual_Run'`,
            type: 'string',
          });
      },
      async (args: Arguments<CreateManualRunCommandArgs>) => {
        try {
          const projectId = await this.getProjectId(args);
          const planId = await this.getId(args, 'plan', projectId, false);
          const milestoneId = await this.getId(
            args,
            'milestone',
            projectId,
            false,
          );
          const response = await this.createManualRun(
            args,
            planId,
            milestoneId,
          );
          console.log(response);
        } catch (error) {
          logError(error);
        }
      },
    );
  }

  private async createManualRun(
    args: Arguments,
    planId: number | undefined,
    milestoneId: number | undefined,
  ): Promise<Run> {
    const formData: any = {
      is_complete: 0,
      is_running: 1,
      plan_id: planId,
      project_id: this.projectId,
      start_time: new Date().toISOString(),
      name: args.run_name as string,
      milestone_id: milestoneId,
    };

    return await runCreateOne(formData);
  }
}
