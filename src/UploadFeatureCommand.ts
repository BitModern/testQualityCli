import { Command } from './Command';
import { type Arguments, type Argv } from 'yargs';
import { logError } from './logError';
import { glob } from 'glob';
import * as fs from 'fs';
import FormData from 'form-data';
import { getResponse } from '@testquality/sdk';

export class UploadFeatureCommand extends Command {
  constructor() {
    super(
      'upload_feature <files>',
      'Gherkin feature files Upload',
      (args: Argv) => {
        return args
          .positional('files', {
            describe: `glob Gherkin feature file, example: upload_feature '**/*.feature'`,
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
            const response = await this.uploadFeatureFiles(
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

  private async uploadFeatureFiles(
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
      url: `/import_feature`,
      method: 'POST',
      data,
      headers: data.getHeaders(),
    });
  }
}
