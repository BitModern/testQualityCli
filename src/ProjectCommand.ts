import { Command } from './Command';
import { logError } from './error';
import { tqGet } from './tqGet';
import { IResourceList } from './ResourceList';

export interface IProjectResource {
  id: number;
  key: number;
  created_by: number;
  created_at: Date;
  updated_by: number;
  updated_at: Date;
  epoch: number;
  name: string;
  description: string;
  access_role_id: number;
  client_id: number;
  color: string;
  picture: string;
  requirement_reference_id: string;
  virtual: any;
  metadata_model: string;
}

export class ProjectCommand extends Command {
  constructor() {
    super(
      'projects',
      'List projects TestQuality',
      args => {
        return args;
      },
      args => {
        this.auth.update(args).then(
          accessToken => {
            tqGet<IResourceList<IProjectResource>>(
              accessToken,
              '/project'
            ).then(
              projectList => {
                console.log(
                  projectList.data.map(p => {
                    return { id: p.id, key: p.key, name: p.name };
                  })
                );
              },
              error => logError(error)
            );
          },
          error => logError(error)
        );
      }
    );
  }
}
