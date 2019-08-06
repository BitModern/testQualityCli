import { Command } from './Command';
import { tqGet } from './tqGet';
import { IResourceList } from './ResourceList';
import { logError } from './error';

export interface IPlanResource {
  id: number;
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
        return args;
      },
      args => {
        this.auth.update(args).then(
          accessToken => {
            if (!this.auth.projectId) {
              logError(
                'Project is required. Try adding "--project_name=<name>" or "--project_id=<number>"'
              );
            } else {
              tqGet<IResourceList<IPlanResource>>(
                accessToken,
                `/plan?project_id=${this.auth.projectId}`
              ).then(
                planList => {
                  console.log(
                    planList.data.map(p => {
                      return { id: p.id, name: p.name };
                    })
                  );
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
