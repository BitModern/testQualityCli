import { Command } from './Command';
import { logError } from './logError';
import { tqRequest } from './tqRequest';
import { ResourceList } from './gen/models/ResourceList';
import { SuiteApi } from './gen/domain/suite/SuiteApi';

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
        this.auth.update(args).then(async () => {
          const params = args.params ? (args.params as string[]).join('&') : '';
          const revisionLog = args.revision_log
            ? '?revision_log=true' + (args.params ? '&' + params : '')
            : args.params
            ? '?' + params
            : '';
          if (!args.delete) {
            const url =
              (args.plan_id ? `/plan/${args.plan_id}` : '') +
              (args.suite_id ? `/plan/${args.suite_id}` : '') +
              `/test${revisionLog}`;
            console.log(url);

            tqRequest<ResourceList<SuiteApi>>(url).then(
              (list) => {
                if (args.revision_log) {
                  console.log(list);
                } else {
                  if (list.total > 0) {
                    console.log(
                      list.data.map((p) => {
                        if (args.params) {
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
              const testId = args.test_id;
              if (!testId) {
                logError(
                  'Test id is required to perform delete, try adding --test_id=<number>'
                );
              }
              const url =
                (args.suite_id ? `/plan/${args.suite_id}` : '') +
                `/test/${testId}`;
              console.log(url);

              const result = await tqRequest<ResourceList<SuiteApi>>(
                url,
                'DELETE'
              );
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
