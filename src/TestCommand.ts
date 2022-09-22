import { testDeleteOne, testGetMany } from '@testquality/sdk';
import { Command } from './Command';
import { logError } from './logError';

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
          });
      },
      (args) => {
        this.reLogin(args).then(async () => {
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

            testGetMany({ url, params }).then(
              (list) => {
                if (args.revision_log) {
                  console.log(list);
                } else {
                  if (list.total > 0) {
                    console.log(
                      list.data.map((p) => {
                        if (args.params || args.verbose) {
                          return p;
                        } else {
                          return { id: p.id, key: p.key, name: p.name };
                        }
                      })
                    );
                  } else {
                    console.log('Result is empty');
                  }
                }
              },
              (error) => logError(error)
            );
          } else {
            try {
              const testId = args.test_id as number;
              if (!testId) {
                logError(
                  'Test id is required to perform delete, try adding --test_id=<number>'
                );
              }
              const url =
                (args.suite_id ? `/plan/${args.suite_id}` : '') + `/test`;
              console.log(url);

              const result = await testDeleteOne(testId, { url });
              console.log('Delete Success ', result);
            } catch (error) {
              logError(error);
            }
          }
        });
      }
    );
  }
}
