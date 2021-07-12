import { milestoneGetMany } from '@testquality/sdk';
import { Command } from './Command';
import { logError } from './logError';

export class MilestoneCommand extends Command {
  constructor() {
    super(
      'milestones',
      'List milestones in project.',
      (args) => {
        return args.option('revision_log', {
          alias: 'rl',
          describe: 'Get history',
          type: 'boolean',
          default: false,
          boolean: true,
        });
      },
      (args) => {
        this.getProjectId(args).then(
          (projectId) => {
            if (!projectId) {
              logError(
                'Project is required. Try adding "--project_name=<name>" or "--project_id=<number>"'
              );
            } else {
              milestoneGetMany({
                params: {
                  project_id: projectId,
                  revision_log: args.revision_log ? true : undefined,
                },
              }).then(
                (milestoneList) => {
                  if (args.revision_log) {
                    console.log(milestoneList);
                  } else {
                    console.log(
                      args.verbose
                        ? milestoneList
                        : milestoneList.data.map((p) => {
                            return { id: p.id, name: p.name };
                          })
                    );
                  }
                },
                (error) => logError(error)
              );
            }
          },
          (error) => logError(error)
        );
      }
    );
  }
}
