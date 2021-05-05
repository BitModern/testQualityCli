import { Command } from './Command';
import { logError } from './logError';
import { tqPost } from './tqRequest';

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
          });
      },
      (args) => {
        this.auth.update(args).then(
          () => {
            if (args.test_id) {
              const options = args.suite_id
                ? { suite_id: args.suite_id }
                : undefined;
              this.postRestore('test', args.test_id as string, options).then(
                (response) => console.log(response),
                (error) => logError(error)
              );
            } else if (args.suite_id) {
              const options = args.plan_id
                ? { plan_id: args.plan_id }
                : undefined;
              this.postRestore('suite', args.suite_id as string, options).then(
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

  private postRestore(type: string, id: string, body?: any): Promise<any> {
    const url = `/${type}/${id}/restore`;
    return tqPost(url, body);
  }
}
