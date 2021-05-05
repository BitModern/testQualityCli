import { Command } from './Command';
import { tqRequest } from './tqRequest';
import { logError } from './logError';
import { ResourceList } from './gen/models/ResourceList';
import { Plan } from './gen/domain/plan/Plan';

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
        this.auth.update(args).then(
          () => {
            const params = args.params
              ? (args.params as string[]).join('&')
              : '';
            const project = this.auth.projectId
              ? `?project_id=${this.auth.projectId}`
              : '';
            const revisionLog = args.revision_log
              ? (project !== '' ? '&' : '?') +
                'revision_log=true' +
                (args.params ? '&' + params : '')
              : args.params
              ? '?' + params
              : '';
            const url = `/plan${project}${revisionLog}`;
            console.log(url);

            tqRequest<ResourceList<Plan>>(url).then(
              (planList) => {
                if (args.revision_log) {
                  console.log(planList);
                } else {
                  if (planList.total > 0) {
                    console.log(
                      planList.data.map((p) => {
                        return {
                          id: p.id,
                          key: p.key,
                          name: p.name,
                          project_id: p.project_id,
                        };
                      })
                    );
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
