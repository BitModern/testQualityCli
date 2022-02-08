import { Command } from './Command';
import { suiteTestGetMany } from '@testquality/sdk';
import { logError } from './logError';

export class SuiteTestCommand extends Command {
  constructor() {
    super(
      'suite_test',
      'List suite test relationships in project.',
      (args) => {
        return args
          .option('revision_log', {
            alias: 'rl',
            describe: 'Get history',
            type: 'boolean',
            default: false,
            boolean: true,
          })
          .option('params', {
            alias: 'p',
            describe: 'Add Properties',
            type: 'array',
          });
      },
      (args) => {
        this.reLogin(args).then(
          () => {
            const params = this.getParams(args);
            if (args.revision_log) {
              params.revision_log = 'true';
            }

            suiteTestGetMany({
              params,
            }).then(
              (suiteTest) => {
                if (args.revision_log) {
                  console.log(suiteTest);
                } else {
                  if (suiteTest.total > 0) {
                    if (args.verbose) {
                      console.log(suiteTest.data);
                    } else {
                      console.log(
                        suiteTest.data.map((p) => {
                          return {
                            id: p.id,
                            suite_id: p.suite_id,
                            test_id: p.test_id,
                            sequence_suite: p.sequence_suite,
                          };
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
          },
          (error) => logError(error)
        );
      }
    );
  }
}
