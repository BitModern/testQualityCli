import { Command } from './Command';
import { type Arguments, type Argv } from 'yargs';
import { logError } from './logError';
import { glob } from 'glob';
import * as fs from 'fs';
import FormData from 'form-data';
import { getResponse } from '@testquality/sdk';
import { logger } from './Logger';
import { appendFiles, chunk, MAX_FILES_PER_REQUEST } from './uploadFiles';

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
          })
          .option('batch_size', {
            describe: `Files sent per request (1-${MAX_FILES_PER_REQUEST}); larger sets are uploaded in sequential batches`,
            type: 'number',
            default: MAX_FILES_PER_REQUEST,
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

  private buildForm(args: Arguments, projectId?: number): FormData {
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
    return data;
  }

  private async post(data: FormData): Promise<any> {
    return await getResponse(this.client.api, {
      url: `/import_feature`,
      method: 'POST',
      data,
      headers: data.getHeaders(),
    });
  }

  private async uploadFeatureFiles(
    args: Arguments,
    matches: string[],
    projectId?: number,
  ): Promise<any> {
    if (matches.length === 0) {
      throw Error('No matching files');
    }
    const batchSize = Number(args.batch_size ?? MAX_FILES_PER_REQUEST);
    if (
      !Number.isInteger(batchSize) ||
      batchSize < 1 ||
      batchSize > MAX_FILES_PER_REQUEST
    ) {
      throw new Error(
        `--batch_size must be an integer between 1 and ${MAX_FILES_PER_REQUEST}, got ${String(args.batch_size)}`,
      );
    }

    if (matches.length === 1) {
      const data = this.buildForm(args, projectId);
      data.append('file', fs.createReadStream(matches[0]));
      return await this.post(data);
    }

    const batches = chunk(matches, batchSize);
    if (args.verbose) {
      console.log('Matching files: ', matches);
    }
    if (batches.length > 1) {
      console.log(
        `Uploading ${matches.length} files in ${batches.length} batches of up to ${batchSize}`,
      );
    }

    const responses: any[] = [];
    for (const [index, batch] of batches.entries()) {
      const label = `Batch ${index + 1}/${batches.length}`;
      const data = appendFiles(this.buildForm(args, projectId), batch);
      try {
        responses.push(await this.post(data));
      } catch (error) {
        const uploaded = batches
          .slice(0, index)
          .reduce((sum, b) => sum + b.length, 0);
        logger.error(
          `${label} failed (${batch.length} files). ` +
            `${uploaded} of ${matches.length} files were uploaded by earlier batches; ` +
            'this batch and any after it were not. Files in the failed batch:\n' +
            batch.map((f) => `  ${f}`).join('\n'),
        );
        throw error;
      }
      if (batches.length > 1) {
        console.log(`${label} uploaded (${batch.length} files)`);
      }
    }

    if (batches.length === 1) {
      return responses[0];
    }
    console.log(
      `Uploaded ${matches.length} files in ${batches.length} batches`,
    );
    return responses;
  }
}
