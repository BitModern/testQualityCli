import {
  type Run,
  runGetMany,
  type TQRequestParameters,
} from '@testquality/sdk';
import { Command } from './Command';
import { logError } from './logError';

export class RunCommand extends Command {
  constructor() {
    super(
      'runs',
      'List runs in project.',
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
          })
          .option('is_manual', {
            alias: 'm',
            describe: 'Only manual tests',
            type: 'boolean',
            default: false,
            boolean: true,
          });
      },
      (args) => {
        this.getProjectId(args).then(
          (projectId) => {
            const params = (args.params || {}) as Partial<Run> &
              TQRequestParameters;
            if (projectId) {
              params.project_id = projectId;
            }
            if (args.revision_log) {
              params.revision_log = true;
            }

            console.log(params);

            runGetMany({ params }).then(
              (list) => {
                if (args.revision_log) {
                  console.log(list);
                } else {
                  if (list.total > 0) {
                    console.log(list.data);
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
