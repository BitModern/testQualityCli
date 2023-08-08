import { Command } from './Command';
import {
  DefectApi,
  defectGetMany,
  defectRunResultGetMany,
} from '@testquality/sdk';
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
      async (args) => {
        try {
          const projectId = await this.getProjectId(args);
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

          const defects = await defectGetMany({ params });

          if (args.revision_log) {
            console.log(defects);
            return;
          }

          if (defects.total === 0) {
            console.log('Result is empty');
            return;
          }

          if (args.verbose) {
            console.log(defects.data);
            return;
          }

          const data = await Promise.all(
            defects.data.map((d) => this.getDefectDetails(d))
          );
          console.dir(data, { depth: 3 });
        } catch (err) {
          logError(err);
        }
      }
    );
  }

  public getDefectDetails(defect: DefectApi) {
    return defectRunResultGetMany({
      params: {
        defect_id: defect.id,
        _with: 'runResult,runResult.run,runResult.test,runResult.status',
        per_page: -1,
      },
    })
      .then((res) => {
        return res.data.map((drr) => ({
          run_id: drr?.run_result?.run_id,
          run_name: drr?.run_result?.run?.name,
          test_id: drr?.run_result?.test_id,
          test_key: drr?.run_result?.test?.key,
          test_name: drr?.run_result?.test?.name,
          status_id: drr?.run_result?.status_id,
          status_name: drr?.run_result?.status?.name,
        }));
      })
      .then((runResults) => ({
        id: defect.id,
        external_reference_id: defect.external_reference_id,
        integration_project_id: defect.integration_project_id,
        payload: defect.payload,
        defect_status_id: defect.defect_status_id,
        defect_res_id: defect.defect_res_id,
        key: defect.key,
        project_id: defect.project_id,
        run_results: runResults,
      }));
  }
}
