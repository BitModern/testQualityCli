import { planGetMany } from '@testquality/sdk';
import { Command } from './Command';
import { logError } from './logError';

export class PlanCommand extends Command {
  constructor() {
    super(
      'plans',
      'List plans in project.',
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
        this.getProjectId(args).then(
          (projectId) => {
            const params = this.getParams(args);
            if (projectId) {
              params.project_id = projectId;
            }
            if (args.revision_log) {
              params.revision_log = 'true';
            }

            planGetMany({
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
                            key: p.key,
                            name: p.name,
                            project_id: p.project_id,
                          };
                        }),
                      );
                    }
                  } else {
                    console.log('Result is empty');
                  }
                }
              },
              (error) => {
                logError(error);
              },
            );
          },
          (error) => {
            logError(error);
          },
        );
      },
    );
  }
}
