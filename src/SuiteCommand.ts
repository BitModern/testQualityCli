import { suiteDeleteOne, suiteGetMany } from '@testquality/sdk';
import { Command } from './Command';
import { logError } from './logError';
import { type Arguments } from 'yargs';

interface SuiteCommandArgs {
  plan_id?: string;
  suite_id?: string;
  revision_log?: boolean;
  delete?: boolean;
  params?: string[];
  verbose?: boolean;
}

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
          })
          .option('plan_id', {
            alias: 'pi',
            describe: 'Plan ID',
            type: 'string',
          });
      },
      async (args: Arguments<SuiteCommandArgs>) => {
        try {
          await this.reLogin(args);
          const params = this.getParams(args);
          if (args.revision_log) {
            params.revision_log = 'true';
          }
          if (!args.delete) {
            const url =
              (args.plan_id ? `/plan/${args.plan_id}` : '') + `/suite`;
            console.log(url);

            const list = await suiteGetMany({ url, params });
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
                    }),
                  );
                }
              } else {
                console.log('Result is empty');
              }
            }
          } else {
            const suiteId = args.suite_id ? parseInt(args.suite_id) : undefined;
            if (!suiteId) {
              logError(
                'Suite id is required to perform delete, try adding --suite_id=<number>',
              );
            } else {
              const url =
                (args.plan_id ? `/plan/${args.plan_id}` : '') + `/suite`;
              console.log(url);

              const result = await suiteDeleteOne(suiteId, { url });
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
