import { Command } from './Command';
import { Arguments, Argv } from 'yargs';
import { env } from './env';
import { logError } from './error';
import { tqGet } from './tqGet';
import { IResourceList } from './ResourceList';
import * as request from 'request-promise-native';
import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';

interface IHasId {
  id: number;
  name: string;
}

export class UploadTestRunCommand extends Command {
  constructor() {
    super(
      'upload_test_run <xmlfiles>',
      'Login to TestQuality',
      (args: Argv) => {
        return args.positional('xmlfiles', {
          describe: `glob JUnit/XUnit XML output file, example: uplaod_test_run '**/*.xml'`,
          type: 'string'
        });
      },
      (args: Arguments) => {
        this.auth.update(args).then(
          accessToken => {
            if (!this.auth.projectId) {
              logError(
                'Project is required. Try adding "--project_name=<name>" or "--project_id=<number>"'
              );
            } else {
              this.getId(args, 'plan', accessToken).then(
                planId => {
                  this.getId(args, 'milestone', accessToken, false).then(
                    milestoneId => {
                      if (args.xmlfiles) {
                        glob(args.xmlfiles as string, {}, (err, matches) => {
                          if (err) {
                            logError(err);
                          } else {
                            console.log('Loading Files: ', matches);
                            if (planId) {
                              this.postXML(
                                accessToken,
                                planId,
                                matches,
                                milestoneId
                              ).then(
                                (response: any) => console.log(response),
                                (error: any) => logError(error)
                              );
                            }
                          }
                        });
                      }
                    },
                    (error: any) => logError(error)
                  );
                },
                (error: any) => logError(error)
              );
            }
          },
          (error: any) => logError(error)
        );
      }
    );
  }

  private getId(
    args: any,
    type: string,
    accessToken: string,
    required: boolean = true
  ): Promise<number | undefined> {
    return new Promise((resolve, reject) => {
      const name = args[type + '_name'] as string;
      if (name) {
        tqGet<IResourceList<IHasId>>(
          accessToken,
          `/${type}?project_id=${this.auth.projectId}`
        ).then(list => {
          const item = list.data.find(
            p => p.name.toLowerCase() === name.toLowerCase()
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

  private postXML(
    accessToken: string,
    planId: number | undefined,
    matches: string[],
    milestoneId: number | undefined
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = `${env.host}/plan/${planId}/junit_xml`;
      const formData: any = {};
      if (matches.length > 1) {
        formData['files[]'] = matches.map(f =>
          fs.createReadStream(path.join(process.cwd(), f))
        );
        console.log(formData);
      } else {
        formData.file = fs.createReadStream(
          path.join(process.cwd(), matches[0])
        );
      }
      if (milestoneId) {
        formData.milestone_id = milestoneId;
      }
      const options = {
        method: 'POST',
        url,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        formData,
        json: true // Automatically parses the JSON string in the response
      };
      return request(options).then((body: any) => {
        resolve(body);
      }, reject);
    });
  }
}
