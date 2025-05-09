import { Command } from './Command';
import { type Arguments, type Argv } from 'yargs';
import { logError } from './logError';
import { glob } from 'glob';
import * as fs from 'fs';
import FormData = require('form-data');
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
          .option('milestone_id', {
            alias: 'mi',
            describe: 'Milestone ID',
            type: 'string',
          });
      },
      async (args: Arguments) => {
        try {
          const projectId = await this.getProjectId(args);
          const planId = await this.getId(args, 'plan', projectId);
          const milestoneId = await this.getId(
            args,
            'milestone',
            projectId,
            false,
          );
          if (args.files && planId) {
            const matches = await glob(args.files as string, {
              realpath: true,
            });
            await this.uploadFeatureFiles(
              args,
              planId,
              matches,
              milestoneId,
            ).then(console.log);
          }
        } catch (error) {
          logError(error);
        }
      },
    );
  }

  private async uploadFeatureFiles(
    args: Arguments,
    planId: number | undefined,
    matches: string[],
    milestoneId: number | undefined,
  ): Promise<any> {
    const url = `/plan/${planId}/import_feature`;
    const data = new FormData();

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
    if (milestoneId) {
      data.append('milestone_id', milestoneId);
    }
    return await getResponse(this.client.api, {
      url,
      method: 'POST',
      data,
      headers: data.getHeaders(),
    });
  }
}
