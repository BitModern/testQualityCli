import { Command } from './Command';
import { DefectApi, defectGetMany, runResultGetOne } from '@testquality/sdk';
import { logError } from './logError';

export class DefectCommand extends Command {
  constructor() {
    super(
      'defects',
      'List defects and related runs in a project.',
      (args) => {
        return args
          .option('revision_log', {
            alias: 'rl',
            describe: 'Get history',
            type: 'boolean',
            default: false,
            boolean: true,
          })
          .option('external_reference_id', {
            alias: 'ei',
            describe: 'Remote defect key from integration',
            type: 'string',
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

            if (args.external_referece_id) {
              params.external_reference_id = args.external_reference_id;
            }
            defectGetMany({
              params,
            }).then(
              (defects) => {
                if (args.revision_log) {
                  console.log(defects);
                } else {
                  if (defects.total > 0) {
                    if (args.verbose) {
                      console.log(defects.data);
                    } else {
                      Promise.all(
                        defects.data.map((d) => {
                          return this.getDefectDetails(d);
                        })
                      ).then((data) => {
                        console.log(data);
                      });
                    }
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

  public getDefectDetails(defect: DefectApi) {
    const runResultId = defect.related_id as number;
    return runResultGetOne(runResultId, {
      params: { _with: 'run,test,status' },
    }).then((runResult) => {
      return {
        id: defect.id,
        external_reference_id: defect.external_reference_id,
        run_id: runResult.run_id,
        run_name: runResult.run?.name,
        test_id: runResult.test_id,
        test_key: runResult.test?.key,
        test_name: runResult.test?.name,
        status_id: runResult.status_id,
        status_name: runResult.status?.name,
        integration_project_id: defect.integration_project_id,
        payload: defect.payload,
        defect_status_id: defect.defect_status_id,
        defect_res_id: defect.defect_res_id,
        key: defect.key,
        project_id: defect.project_id,
      };
    });
  }
}
