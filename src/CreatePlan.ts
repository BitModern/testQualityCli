import { Command } from './Command';
import { Arguments, Argv } from 'yargs';
import { logError } from './logError';
import { tqPost } from './tqRequest';
import { PlanApi } from './gen/domain/plan/PlanApi';

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
      (args: Arguments) => {
        this.auth.update(args).then(() => {
          if (!this.auth.projectId) {
            logError(
              'Project is required. Try adding "--project_name=<name>" or "--project_id=<number>"'
            );
            return;
          }
          if (!args.name) {
            logError('Plan name is required.');
            return;
          }
          const formData = {
            project_id: this.auth.projectId,
            name: args.name,
          };
          if (args.duplicates) {
            const duplicates: number = args.duplicates as number;
            for (let idx = 0; idx < duplicates; idx += 1) {
              formData.name = args.name + ' ' + idx.toString(10);
              tqPost<PlanApi>('/plan', formData).then(
                (plan) => {
                  console.log(plan);
                },
                (error) => logError(error)
              );
            }
          } else {
            tqPost<PlanApi>('/plan', formData).then(
              (plan) => {
                console.log(plan);
              },
              (error) => logError(error)
            );
          }
        });
      }
    );
  }
}
