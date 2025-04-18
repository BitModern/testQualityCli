import { Command } from './Command';
import { type Arguments, type Argv } from 'yargs';
import { logError } from './logError';
import { glob } from 'glob';
import * as fs from 'fs';
import { PlanRoute, getResponse } from '@testquality/sdk';
import FormData = require('form-data');

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
            await this.uploadFeatureResultFiles(
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

  private async uploadFeatureResultFiles(
    args: Arguments,
    planId: number,
    matches: string[],
    milestoneId: number | undefined,
  ): Promise<any> {
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
      url: `${PlanRoute()}/${planId}/import_feature_results`,
      method: 'POST',
      data,
      headers: data.getHeaders(),
    });
  }
}
