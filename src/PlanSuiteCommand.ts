import { Command } from './Command';
import { planSuiteGetMany } from '@testquality/sdk';
import { logError } from './logError';

export class PlanSuiteCommand extends Command {
  constructor() {
    super(
      'plan_suite',
      'List plan suite relationships in project.',
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

            planSuiteGetMany({
              params,
            }).then(
              (planList) => {
                if (args.revision_log) {
                  console.log(planList);
                } else {
                  if (planList.total > 0) {
                    if (args.verbose) {
                      console.log(planList.data);
                    } else {
                      console.log(
                        planList.data.map((p) => {
                          return {
                            id: p.id,
                            plan_id: p.plan_id,
                            suite_id: p.suite_id,
                            sequence_plan: p.sequence_plan,
                            suite_offset: p.suite_offset,
                            parent_id: p.parent_id,
                            hierarchy_level: p.hierarchy_level,
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
