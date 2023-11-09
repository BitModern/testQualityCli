import { Command } from './Command';
import { Arguments, Argv } from 'yargs';
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
        return args.positional('files', {
          describe: `glob Gherkin feature file, example: upload_feature '**/*.feature'`,
          type: 'string',
        });
      },
      (args: Arguments) => {
        this.getProjectId(args).then(
          (projectId) => {
            this.getId(args, 'plan', projectId).then(
              (planId) => {
                this.getId(args, 'milestone', projectId, false).then(
                  (milestoneId) => {
                    if (args.files) {
                      glob(
                        args.files as string,
                        { realpath: true }).then((matches) => {
                          if (planId) {
                            this.uploadFeatureFiles(
                              args,
                              planId,
                              matches,
                              milestoneId
                            ).then(
                              (response: any) => console.log(response),
                              (error: any) => logError(error)
                            );
                          }
                        }, (err) => logError(err)
                      );
                    }
                  },
                  (error: any) => logError(error)
                );
              },
              (error: any) => logError(error)
            );
          },
          (error: any) => logError(error)
        );
      }
    );
  }

  private uploadFeatureFiles(
    args: Arguments,
    planId: number | undefined,
    matches: string[],
    milestoneId: number | undefined
  ): Promise<any> {
    const url = `/plan/${planId}/import_feature`;
    const data = new FormData();

    if (matches.length > 1) {
      data.append(
        'files[]',
        matches.map((f) => fs.createReadStream(f))
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
    return getResponse(this.client.api, {
      url,
      method: 'POST',
      data,
      headers: data.getHeaders(),
    });
  }
}
