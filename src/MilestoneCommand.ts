import { Command } from './Command';
import { logError } from './logError';
import { tqRequest } from './tqRequest';
import { ResourceList } from './gen/models/ResourceList';
import { MilestoneApi } from './gen/domain/milestone/MilestoneApi';

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
        this.auth.update(args).then(
          () => {
            if (!this.auth.projectId) {
              logError(
                'Project is required. Try adding "--project_name=<name>" or "--project_id=<number>"'
              );
            } else {
              const project = this.auth.projectId
                ? `?project_id=${this.auth.projectId}`
                : '';
              const revisionLog = args.revision_log
                ? (project !== '' ? '&' : '?') + 'revision_log=true'
                : '';
              const url = `/milestone${project}${revisionLog}`;
              tqRequest<ResourceList<MilestoneApi>>(url).then(
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
