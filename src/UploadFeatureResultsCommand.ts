import { Command } from './Command';
import { type Arguments, type Argv } from 'yargs';
import { logError } from './logError';
import { glob } from 'glob';
import * as fs from 'fs';
import { getResponse } from '@testquality/sdk';
import FormData from 'form-data';

export class UploadFeatureResultsCommand extends Command {
  constructor() {
    super(
      'upload_feature_results <files>',
      'Gherkin Result files Upload',
      (args: Argv) => {
        return args
          .positional('files', {
            describe: `glob Gherkin result file, example: upload_feature_results '**/*.json`,
            type: 'string',
          })
          .option('milestone_id', {
            alias: 'mi',
            describe: 'Milestone ID',
            type: 'string',
          })
          .option('milestone_name', {
            alias: 'mn',
            describe: 'Milestone Name',
            type: 'string',
          })
          .option('plan_id', {
            alias: 'pi',
            describe: 'Plan ID',
            type: 'string',
          })
          .option('plan_name', {
            alias: 'pn',
            describe: 'Plan Name',
            type: 'string',
          })
          .option('automation_id', {
            alias: 'ai',
            describe: 'Automation ID',
            type: 'string',
          })
          .option('automation_name', {
            alias: 'an',
            describe: 'Automation Name',
            type: 'string',
          })
          .option('run_name', {
            alias: 'rn',
            describe: 'Run name',
            type: 'string',
          })
          .option('folder_id', {
            alias: 'fi',
            describe: 'Folder id',
            type: 'string',
          });
      },
      async (args: Arguments) => {
        try {
          const projectId = await this.getProjectId(args);
          if (args.files) {
            const matches = await glob(args.files as string, {
              realpath: true,
            });
            const response = await this.uploadFeatureResultFiles(
              args,
              matches,
              projectId,
            );
            console.log(response);
          }
        } catch (error) {
          logError(error);
        }
      },
    );
  }

  private async uploadFeatureResultFiles(
    args: Arguments,
    matches: string[],
    projectId?: number,
  ): Promise<any> {
    const data = new FormData();

    if (projectId) {
      data.append('project_id', projectId);
    }
    if (args.plan_id) {
      data.append('plan_id', args.plan_id);
    } else if (args.plan_name) {
      data.append('plan_name', args.plan_name);
    } else if (args.automation_id) {
      data.append('automation_id', args.automation_id);
    } else if (args.automation_name) {
      data.append('automation_name', args.automation_name);
    }
    if (args.run_name) {
      data.append('run_name', args.run_name);
    }
    if (args.milestone_id) {
      data.append('milestone_id', args.milestone_id);
    } else if (args.milestone_name) {
      data.append('milestone_name', args.milestone_name);
    }

    if (args.folder_id) {
      data.append('suite_id', args.folder_id);
    }
    if (matches.length > 1) {
      data.append(
        'files[]',
        matches.map((f) => fs.createReadStream(f)),
      );
      if (args.verbose) {
        console.log('Matching files: ', matches);
        console.log('Form data to send: ', data);
      }
    } else if (matches.length === 1) {
      data.append('file', fs.createReadStream(matches[0]));
    } else {
      throw Error('No matching files');
    }

    return await getResponse(this.client.api, {
      url: `/import_feature_results`,
      method: 'POST',
      data,
      headers: data.getHeaders(),
    });
  }
}
