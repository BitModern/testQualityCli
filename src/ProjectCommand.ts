import { Command } from './Command';
import { logError } from './logError';
import { tqRequest } from './tqRequest';
import { ResourceList } from './gen/models/ResourceList';
import { ProjectApi } from './gen/domain/project/ProjectApi';

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
        this.auth.update(args).then(
          () => {
            tqRequest<ResourceList<ProjectApi>>('/project').then(
              (projectList) => {
                console.log(
                  projectList.data.map((p) => {
                    return { id: p.id, key: p.key, name: p.name };
                  })
                );
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
