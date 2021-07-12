import { suiteDeleteOne, suiteGetMany } from '@testquality/sdk';
import { Command } from './Command';
import { logError } from './logError';

export class SuiteCommand extends Command {
  constructor() {
    super(
      'suites',
      'List suites in project.',
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
            describe: 'delete a suite',
            type: 'boolean',
            default: false,
            boolean: true,
          })
          .option('suite_id', {
            alias: 'si',
            describe: 'Suite to delete',
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
              (args.plan_id ? `/plan/${args.plan_id}` : '') + `/suite`;
            console.log(url);

            suiteGetMany({ url, params }).then(
              (list) => {
                if (args.revision_log) {
                  console.log(list);
                } else {
                  if (list.total > 0) {
                    if (args.verbose) {
                      console.log(list.data);
                    } else {
                      console.log(
                        list.data.map((p) => {
                          return { id: p.id, key: p.key, name: p.name };
                        })
                      );
                    }
                  } else {
                    console.log('Result is empty');
                  }
                }
              },
              (error) => logError(error)
            );
          } else {
            try {
              const suiteId = args.suite_id as number;
              if (!suiteId) {
                logError(
                  'Suite id is required to perform delete, try adding --suite_id=<number>'
                );
              }
              const url =
                (args.plan_id ? `/plan/${args.plan_id}` : '') + `/suite`;
              console.log(url);

              const result = await suiteDeleteOne(suiteId, { url });
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
