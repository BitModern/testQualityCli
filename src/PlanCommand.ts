import { Command } from './Command';
import { tqGet } from './tqGet';
import { IResourceList } from './ResourceList';
import { logError } from './error';

export interface IPlanResource {
  id: number;
  key: number;
  created_by: number;
  created_at: Date;
  updated_by: number;
  updated_at: Date;
  epoch: number;
  project_id: number;
  assigned_to_tester: number;
  milestone_id: number;
  virtual: any;
  name: string;
  description: string;
  client_id: number;
  requirement_reference_id: string;
  metadata_model: string;
}

export class PlanCommand extends Command {
  constructor() {
    super(
      'plans',
      'List plans in project.',
      args => {
        return args.option('revision_log', {
          alias: 'rl',
          describe: 'Get history',
          type: 'boolean',
          default: false,
          boolean: true
        });
      },
      args => {
        this.auth.update(args).then(
          accessToken => {
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
              const url = `/plan${project}${revisionLog}`;
              console.log(url);

              tqGet<IResourceList<IPlanResource>>(accessToken, url).then(
                planList => {
                  if (args.revision_log) {
                    console.log(planList);
                  } else {
                    if (planList.total > 0) {
                      console.log(
                        planList.data.map(p => {
                          return { id: p.id, key: p.key, name: p.name };
                        })
                      );
                    } else {
                      console.log('Result is empty');
                    }
                  }
                },
                error => logError(error)
              );
            }
          },
          error => logError(error)
        );
      }
    );
  }
}
