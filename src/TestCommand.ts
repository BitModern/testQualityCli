import { testDeleteOne, testGetMany } from '@testquality/sdk';
import { Command } from './Command';
import { logError } from './logError';
import { type Arguments } from 'yargs';

interface TestCommandArgs {
  plan_id?: string;
  suite_id?: string;
  revision_log?: boolean;
  delete?: boolean;
  test_id?: string;
  params?: string[];
  verbose?: boolean;
}

export class TestCommand extends Command {
  constructor() {
    super(
      'tests',
      'List tests in project.',
      (args) => {
        return args
          .option('revision_log', {
            alias: 'rl',
            describe: 'Get history',
            type: 'boolean',
            default: false,
            boolean: true,
          })
          .option('delete', {
            alias: 'dl',
            describe: 'delete a test',
            type: 'boolean',
            default: false,
            boolean: true,
          })
          .option('suite_id', {
            alias: 'si',
            describe: 'Suite test belong to',
            type: 'string',
          })
          .option('test_id', {
            alias: 'tc',
            describe: 'Test to delete',
            type: 'string',
          })
          .option('params', {
            alias: 'p',
            describe: 'Add Properties',
            type: 'array',
          })
          .option('plan_id', {
            alias: 'pi',
            describe: 'Plan ID',
            type: 'string',
          });
      },
      async (args: Arguments<TestCommandArgs>) => {
        try {
          await this.reLogin(args);

          const params = this.getParams(args);
          if (args.revision_log) {
            params.revision_log = 'true';
          }

          if (!args.delete) {
            const url =
              (args.plan_id ? `/plan/${args.plan_id}` : '') +
              (args.suite_id ? `/suite/${args.suite_id}` : '') +
              `/test`;
            console.log(url);

            const list = await testGetMany({ url, params });
            if (args.revision_log) {
              console.log(list);
            } else {
              if (list.total > 0) {
                console.log(
                  list.data.map((p) => {
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    if (args.params || args.verbose) {
                      return p;
                    } else {
                      return { id: p.id, key: p.key, name: p.name };
                    }
                  }),
                );
              } else {
                console.log('Result is empty');
              }
            }
          } else {
            const testId = args.test_id ? parseInt(args.test_id) : undefined;
            if (!testId) {
              logError(
                'Test id is required to perform delete, try adding --test_id=<number>',
              );
            } else {
              const url =
                (args.suite_id ? `/plan/${args.suite_id}` : '') + `/test`;
              console.log(url);

              const result = await testDeleteOne(testId, { url });
              console.log('Delete Success ', result);
            }
          }
        } catch (error) {
          logError(error);
        }
      },
    );
  }
}
