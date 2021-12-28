import { projectGetMany } from '@testquality/sdk';
import { Command } from './Command';
import { logError } from './logError';

export class ProjectCommand extends Command {
  constructor() {
    super(
      'projects',
      'List projects TestQuality',
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
        this.reLogin(args).then(
          () => {
            projectGetMany({params: {per_page: -1}}).then(
              (projectList) => {
                if (args.verbose) {
                  console.log(projectList.data);
                } else {
                  console.log(
                    projectList.data.map((p) => {
                      return { id: p.id, key: p.key, name: p.name };
                    })
                  );
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
