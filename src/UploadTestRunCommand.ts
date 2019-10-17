import { Command } from './Command';
import { Arguments, Argv } from 'yargs';
import { env } from './env';
import { logError } from './error';
import { logInfo } from './info';
import { logWarning } from './warning';
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

interface IAttachmentsResult {
  resolved: string[];
  unresolved: string[];
}

export class UploadTestRunCommand extends Command {
  constructor() {
    super(
      'upload_test_run <xmlfiles>',
      'JUnit/XUnit XML Upload',
      (args: Argv) => {
        return args.positional('xmlfiles', {
          describe: `glob JUnit/XUnit XML output file, example: upload_test_run '**/*.xml'`,
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
                                          args,
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
                              this.parseXMLFiles(matches, undefined).then(
                                attachments => {
                                  if (planId) {
                                    this.uploadTestResults(
                                      args,
                                      accessToken,
                                      planId,
                                      matches,
                                      milestoneId,
                                      attachments
                                    ).then(
                                      (response: any) => console.log(response),
                                      (error: any) => logError(error)
                                    );
                                  }
                                }
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

  private getTestCases(json: any): object[] {
    const results: object[] = [];
    try {
      if (json.testsuites) {
        if (json.testsuites.testsuite) {
          if (Array.isArray(json.testsuites.testsuite)) {
            json.testsuites.testsuite.forEach((testsuite: any) => {
              if (testsuite.testcase) {
                testsuite.testcase.forEach((testcase: any) => {
                  results.push(testcase);
                });
              }
            });
          } else {
            if (json.testsuites.testsuite.testcase) {
              if (Array.isArray(json.testsuites.testsuite.testcase)) {
                json.testsuites.testsuite.testcase.forEach((testcase: any) => {
                  results.push(testcase);
                });
              } else {
                results.push(json.testsuites.testsuite.testcase);
              }
            }
          }
        }
      } else if (json.testsuite) {
        if (json.testsuite.testcase) {
          if (Array.isArray(json.testsuite.testcase)) {
            json.testsuite.testcase.forEach((testcase: any) => {
              results.push(testcase);
            });
          } else {
            results.push(json.testsuite.testcase);
          }
        }
      }
    } catch (error) {
      logError(error);
    }
    return results;
  }

  private parseXMLFiles(
    xmlFiles: string[],
    outputDir: string[] | undefined
  ): Promise<IAttachmentsResult> {
    return new Promise((resolve, reject) => {
      const SYSTEM_ERR = 'system-err';
      const SYSTEM_OUT = 'system-out';
      const attachmentRegExp = new RegExp(/\[+[ATTACHMENT]+[|](.+.[a-z*3])]]/m);
      const parser = require('fast-xml-parser');
      const result: IAttachmentsResult = { resolved: [], unresolved: [] };
      let matches: RegExpExecArray | null;
      let filePath: string;

      const options = {
        attributeNamePrefix: '',
        ignoreAttributes: false,
        format: false,
        indentBy: '  ',
        supressEmptyNode: false
      };

      xmlFiles.forEach(file => {
        try {
          const json = parser.parse(fs.readFileSync(file, 'utf8'), options);
          const testcases = this.getTestCases(json);
          // console.log('testcases ', testcases);
          if (testcases) {
            testcases.forEach((item: any) => {
              if (outputDir) {
                if (attachmentRegExp.test(item.name)) {
                  matches = attachmentRegExp.exec(item.name);
                  if (matches) {
                    filePath = path.resolve(outputDir[0], matches[1]);
                    if (fs.existsSync(filePath)) {
                      if (!result.resolved.includes(filePath)) {
                        result.resolved.push(filePath);
                      }
                    } else {
                      result.unresolved.push(filePath);
                    }
                  }
                }
              }

              if (item[SYSTEM_OUT]) {
                if (attachmentRegExp.test(item[SYSTEM_OUT])) {
                  matches = attachmentRegExp.exec(item[SYSTEM_OUT]);
                  if (matches) {
                    filePath = path.resolve(matches[1]);
                    if (fs.existsSync(filePath)) {
                      if (!result.resolved.includes(filePath)) {
                        result.resolved.push(filePath);
                      }
                    } else {
                      result.unresolved.push(filePath);
                    }
                  }
                }
              }

              if (item[SYSTEM_ERR]) {
                if (attachmentRegExp.test(item[SYSTEM_ERR])) {
                  matches = attachmentRegExp.exec(item[SYSTEM_ERR]);
                  if (matches) {
                    filePath = path.resolve(matches[1]);
                    if (fs.existsSync(filePath)) {
                      if (!result.resolved.includes(filePath)) {
                        result.resolved.push(filePath);
                      }
                    } else {
                      result.unresolved.push(filePath);
                    }
                  }
                }
              }
            });
          }
          resolve(result);
        } catch (error) {
          reject(error);
        }
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
    args: Arguments,
    accessToken: string,
    planId: number | undefined,
    matches: string[],
    milestoneId: number | undefined,
    attachments: IAttachmentsResult | undefined
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = `${env.host}/plan/${planId}/junit_xml`;
      const formData: any = {};
      if (matches.length > 1 || attachments) {
        formData['files[]'] = matches.map(f => fs.createReadStream(f));
        if (attachments && attachments.resolved.length > 0) {
          logInfo('Resolved attachments:');
          console.log(attachments.resolved);
          formData['files[]'] = formData['files[]'].concat(
            attachments.resolved.map(f => fs.createReadStream(f))
          );
        }
        if (attachments && attachments.unresolved.length > 0) {
          logWarning('Unresolved attachments:');
          console.log(attachments.unresolved);
        }
        if (args.verbose) {
          console.log('Matching files: ', matches);
          console.log('Form data to send: ', formData);
        }
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
