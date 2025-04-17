import { planDeleteOne } from '@testquality/sdk';
import { Command } from './Command';
import { type Arguments, type Argv } from 'yargs';
import { logError } from './logError';

export class PlanDelete extends Command {
  constructor() {
    super(
      'plan_delete <id>',
      'Delete a Cycle/Plan',
      (args: Argv) => {
        return args.positional('id', {
          describe: 'Id of plan',
          type: 'string',
        });
      },
      async (args: Arguments) => {
        try {
          if (!args.id) {
            logError('Plan id is required.');
            return;
          }
          const id = parseInt(args.id as string, 10);
          console.log('id', id);
          await planDeleteOne(id);
          console.log('Plan Deleted');
        } catch (error) {
          logError(error);
        }
      },
    );
  }
}
