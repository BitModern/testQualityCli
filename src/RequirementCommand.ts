import { Command } from './Command';
import {
  RequirementApi,
  requirementGetMany,
  testGetOne,
} from '@testquality/sdk';
import { logError } from './logError';

export class RequirementCommand extends Command {
  constructor() {
    super(
      'requirements',
      'List requirements and related tests in a project.',
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
            describe: 'Remote requirement key from integration',
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
            requirementGetMany({
              params,
            }).then(
              (requirements) => {
                if (args.revision_log) {
                  console.log(requirements);
                } else {
                  if (requirements.total > 0) {
                    if (args.verbose) {
                      console.log(requirements.data);
                    } else {
                      Promise.all(
                        requirements.data.map((r) => {
                          return this.getRequirementDetails(r);
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

  public getRequirementDetails(requirement: RequirementApi) {
    const testId = requirement.related_id as number;
    return testGetOne(testId, {
      params: { _with: 'suite,RunResult,RunResult.run,RunResult.status' },
    }).then((test) => {
      const runResults = test.run_result?.map((runResult) => {
        return {
          run_id: runResult.run_id,
          run_name: runResult.run?.name,
          status_id: runResult.status_id,
          status_name: runResult.status?.name,
        };
      });
      return {
        id: requirement.id,
        external_reference_id: requirement.external_reference_id,
        test_id: test.id,
        test_key: test.key,
        test_name: test.name,
        run_results: JSON.stringify(runResults),
        integration_project_id: requirement.integration_project_id,
        payload: requirement.payload,
        key: requirement.key,
        project_id: requirement.project_id,
      };
    });
  }
}
