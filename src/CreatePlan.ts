import { planCreateOne } from '@testquality/sdk';
import { Command } from './Command';
import { type Arguments, type Argv } from 'yargs';
import { logError } from './logError';

interface CreatePlanArgs {
  name?: string;
}

export class CreatePlan extends Command {
  constructor() {
    super(
      'create_plan <name>',
      'Create a Test Plan without uploading test results',
      (args: Argv) => {
        return args
          .positional('name', {
            describe: 'Name of plan',
            type: 'string',
          })
          .option('duplicates', {
            describe: `Number of items to create`,
            type: 'number',
          });
      },
      async (args: Arguments<CreatePlanArgs>) => {
        try {
          const projectId = await this.getProjectId(args);
          if (!projectId) {
            logError(
              'Project is required. Try adding "--project_name=<name>" or "--project_id=<number>"',
            );
            return;
          }
          if (!args.name) {
            logError('Plan name is required.');
            return;
          }
          const formData = {
            project_id: projectId,
            name: args.name,
          };
          if (args.duplicates) {
            const duplicates: number = args.duplicates as number;
            for (let idx = 0; idx < duplicates; idx += 1) {
              formData.name = args.name + ' ' + idx.toString(10);
              const plan = await planCreateOne(formData);
              console.log(plan);
            }
          } else {
            const plan = await planCreateOne(formData);
            console.log(plan);
          }
        } catch (error) {
          logError(error);
        }
      },
    );
  }
}
