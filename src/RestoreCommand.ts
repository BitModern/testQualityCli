import { getResponse } from '@testquality/sdk';
import { Command } from './Command';
import { logError } from './logError';

export class RestoreCommand extends Command {
  constructor() {
    super(
      'restore',
      'Restore plan, suite or test.',
      (args) => {
        return args
          .option('test_id', {
            alias: 'ti',
            describe: 'Test ID',
            type: 'string',
          })
          .option('suite_id', {
            alias: 'si',
            describe: 'Suite to restore test in, optional',
            type: 'string',
          })
          .option('plan_id', {
            alias: 'pi',
            describe: 'Plan to restore',
            type: 'string',
          });
      },
      (args) => {
        this.reLogin(args).then(
          () => {
            if (args.test_id) {
              const data = args.suite_id
                ? { suite_id: args.suite_id }
                : undefined;
              this.postRestore('test', args.test_id as string, data).then(
                (response) => console.log(response),
                (error) => logError(error)
              );
            } else if (args.suite_id) {
              const data = args.plan_id ? { plan_id: args.plan_id } : undefined;
              this.postRestore('suite', args.suite_id as string, data).then(
                (response) => console.log(response),
                (error) => logError(error)
              );
            } else if (args.plan_id) {
              this.postRestore('plan', args.plan_id as string).then(
                (response) => console.log(response),
                (error) => logError(error)
              );
            } else {
              logError(
                `plan or test is required. Try adding "--plan_id=<number>" or "--test_id=<number>`
              );
            }
          },
          (error) => logError(error)
        );
      }
    );
  }

  private postRestore(type: string, id: string, data?: any): Promise<any> {
    const url = `/${type}/${id}/restore`;
    return getResponse(this.client.api, {
      method: 'post',
      url,
      data,
    });
  }
}
