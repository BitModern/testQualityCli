import { Command } from './Command';
import { Arguments, Argv } from 'yargs';
import { logError } from './logError';
import { tqRequest } from './tqRequest';
import * as glob from 'glob';
import * as fs from 'fs';
import FormData = require('form-data');
import { ResourceList } from './gen/models/ResourceList';
import { HasId } from './HasId';

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
        this.auth.update(args).then(
          () => {
            this.getId(args, 'plan').then(
              (planId) => {
                this.getId(args, 'milestone', false).then(
                  (milestoneId) => {
                    if (args.files) {
                      glob(
                        args.files as string,
                        { realpath: true },
                        (err, matches) => {
                          if (err) {
                            logError(err);
                          } else {
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
                          }
                        }
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

  private getId(
    args: any,
    type: string,
    required: boolean = true
  ): Promise<number | undefined> {
    return new Promise((resolve, reject) => {
      const name = args[type + '_name'] as string;
      if (name) {
        tqRequest<ResourceList<HasId>>(
          `/${type}?project_id=${this.auth.projectId}`
        ).then((list) => {
          const item = list.data.find(
            (p) => p.name.toLowerCase() === name.toLowerCase()
          );
          if (item) {
            resolve(item.id);
          } else {
            reject(`${type} ${name} not found!`);
          }
        }, reject);
      } else {
        const id = args[type + '_id'];
        if (id) {
          resolve(parseInt(id, 10));
        } else if (required) {
          reject(
            `${type} is required. Try adding "--${type}_name=<name>" or "--${type}_id=<number>"`
          );
        } else {
          resolve(undefined);
        }
      }
    });
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
    return tqRequest(url, 'POST', data, data.getHeaders());
  }
}
