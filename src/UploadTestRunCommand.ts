import { Command } from './Command';
import { Arguments, Argv } from 'yargs';
import { env } from './env';
import { logError } from './error';
import { logInfo } from './info';
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
      'JUnit/XUnit XML Upload',
      (args: Argv) => {
        return args.positional('xmlfiles', {
          describe: `glob JUnit/XUnit XML output file, example: uplaod_test_run '**/*.xml'`,
          type: 'string'
        });
      },
      (args: Arguments) => {
        this.auth.update(args).then(
          accessToken => {
            this.getId(args, 'plan', accessToken).then(
              planId => {
                this.getId(args, 'milestone', accessToken, false).then(
                  milestoneId => {
                    if (args.xmlfiles) {
                      glob(
                        args.xmlfiles as string,
                        { realpath: true },
                        (err, matches) => {
                          if (err) {
                            logError(err);
                          } else {
                            if (args.run_result_output_dir) {
                              glob(
                                args.run_result_output_dir as string,
                                {},
                                (errors, outputDir) => {
                                  if (errors) {
                                    logError(errors);
                                  }
                                  this.parseXMLFiles(matches, outputDir).then(
                                    attachments => {
                                      if (planId) {
                                        this.uploadTestResults(
                                          accessToken,
                                          planId,
                                          matches,
                                          milestoneId,
                                          attachments
                                        ).then(
                                          (response: any) =>
                                            console.log(response),
                                          (error: any) => logError(error)
                                        );
                                      }
                                    }
                                  );
                                }
                              );
                            } else {
                              if (planId) {
                                this.uploadTestResults(
                                  accessToken,
                                  planId,
                                  matches,
                                  milestoneId,
                                  undefined
                                ).then(
                                  (response: any) => console.log(response),
                                  (error: any) => logError(error)
                                );
                              }
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

  private parseXMLFiles(
    xmlFiles: string[],
    outputDir: string[]
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      // console.log('Checking provided output dir ', outputDir);
      const SYSTEM_ERR = 'system-err';
      const SYSTEM_OUT = 'system-out';
      const attachmentRegExp = new RegExp(/\[+[ATTACHMENT]+[|](.+.[a-z*3])]]/m);
      const parser = require('xml-stream');
      const attachments: string[] = [];
      const unresolvedAttachments: string[] = [];

      let matches: RegExpExecArray | null;
      let filePath: string;

      xmlFiles.forEach(file => {
        logInfo('Loading XML File: ' + file);
        const xml = new parser(fs.createReadStream(file));

        xml.collect('testcase');
        xml.on('endElement: testcase', (item: any) => {
          if (attachmentRegExp.test(item.$.name)) {
            matches = attachmentRegExp.exec(item.$.name);
            if (matches) {
              filePath = path.resolve(outputDir[0], matches[1]);
              if (fs.existsSync(filePath)) {
                if (!attachments.includes(filePath)) {
                  attachments.push(filePath);
                }
              } else {
                unresolvedAttachments.push(filePath);
              }
            }
          }

          if (item[SYSTEM_OUT]) {
            if (attachmentRegExp.test(item[SYSTEM_OUT])) {
              matches = attachmentRegExp.exec(item[SYSTEM_OUT]);
              if (matches) {
                filePath = path.resolve(outputDir[0], matches[1]);
                if (fs.existsSync(filePath)) {
                  if (!attachments.includes(filePath)) {
                    attachments.push(filePath);
                  }
                } else {
                  unresolvedAttachments.push(filePath);
                }
              }
            }
          }

          if (item[SYSTEM_ERR]) {
            if (attachmentRegExp.test(item[SYSTEM_ERR])) {
              matches = attachmentRegExp.exec(item[SYSTEM_ERR]);
              if (matches) {
                filePath = path.resolve(outputDir[0], matches[1]);
                if (fs.existsSync(filePath)) {
                  if (!attachments.includes(filePath)) {
                    attachments.push(filePath);
                  }
                } else {
                  unresolvedAttachments.push(filePath);
                }
              }
            }
          }
        });

        xml.on('end', () => {
          logInfo('Resolved attachments:');
          console.log(attachments);
          logInfo('Unresolved attachments:');
          console.log(unresolvedAttachments);
          // throw new Error('Stoping error');
          resolve(attachments);
        });
        xml.on('error', () => reject());
      });
    });
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

  private uploadTestResults(
    accessToken: string,
    planId: number | undefined,
    matches: string[],
    milestoneId: number | undefined,
    attachments: string[] | undefined
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = `${env.host}/plan/${planId}/junit_xml`;
      const formData: any = {};
      if (matches.length > 1 || (attachments && attachments.length > 0)) {
        formData['files[]'] = matches.map(f => fs.createReadStream(f));
        if (attachments) {
          formData['files[]'] = formData['files[]'].concat(
            attachments.map(f => fs.createReadStream(f))
          );
        }
        // console.log('Form data to send: ', formData);
      } else if (matches.length === 1) {
        formData.file = fs.createReadStream(matches[0]);
      } else {
        throw Error('No matching files');
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
