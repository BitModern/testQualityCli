import { getResponse } from '@testquality/sdk';
import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import FormData = require('form-data');
import { Command } from './Command';
import { Arguments, Argv } from 'yargs';
import { logError } from './logError';
import { logInfo } from './logInfo';
import { logWarning } from './logWarning';

interface AttachmentsResult {
  resolved: string[];
  unresolved: string[];
}

interface Attachment {
  testsuite: string;
  testcase: string;
  attachmentPath: string;
}

export class UploadTestRunCommand extends Command {
  constructor() {
    super(
      'upload_test_run <xmlfiles>',
      'JUnit/XUnit XML Upload',
      (args: Argv) => {
        return args.positional('xmlfiles', {
          describe: `glob JUnit/XUnit XML output file, example: upload_test_run '**/*.xml'`,
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
                                    (attachments) => {
                                      if (planId) {
                                        this.uploadTestResults(
                                          args,
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
                                (attachments) => {
                                  if (planId) {
                                    this.uploadTestResults(
                                      args,
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

  private findAttachments(
    outputDir: string,
    attachments: Attachment[]
  ): Promise<Attachment[]> {
    return new Promise((resolve, reject) => {
      let items;
      try {
        items = fs.readdirSync(outputDir);
        items.forEach((item: any) => {
          if (fs.lstatSync(path.resolve(outputDir, item)).isDirectory()) {
            if (path.extname(item) === '.feature') {
              const files = fs.readdirSync(path.resolve(outputDir, item));
              files.forEach((file: string) => {
                const testsuite = path
                  .basename(file)
                  .substring(0, path.basename(file).indexOf('--') - 1);
                const testcase = path
                  .basename(file)
                  .substring(
                    path.basename(file).indexOf('--') + 2,
                    path.basename(file).length
                  );
                const attachment: Attachment = {
                  testsuite,
                  testcase,
                  attachmentPath: path.resolve(outputDir, item) + '/' + file,
                };
                attachments.push(attachment);
              });
            } else {
              this.findAttachments(path.resolve(outputDir, item), attachments);
            }
          }
        });
        resolve(attachments);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }

  private getAttachment(
    attachments: Attachment[],
    testsuite: string,
    testcase: string
  ): Promise<Attachment> {
    return new Promise((resolve) => {
      attachments.forEach((item: Attachment) => {
        if (item.testsuite === testsuite.substring(0, item.testsuite.length)) {
          // if (item.testcase.substring(0, testcase.length) === testcase) {
          if (item.testcase.indexOf(testcase) > 0) {
            resolve(item);
          }
        }
      });
    });
  }

  private parseXMLFiles(
    xmlFiles: string[],
    outputDir: string[] | undefined
  ): Promise<AttachmentsResult | undefined> {
    return new Promise((resolve, reject) => {
      const SYSTEM_ERR = 'system-err';
      const SYSTEM_OUT = 'system-out';
      const attachmentRegExp = new RegExp(/\[+[ATTACHMENT]+[|](.+.[a-z*3])]]/m);
      const parser = require('fast-xml-parser');
      const result: AttachmentsResult = { resolved: [], unresolved: [] };
      let matches: RegExpExecArray | null;
      let filePath: string;

      const options = {
        attributeNamePrefix: '',
        ignoreAttributes: false,
        format: false,
        indentBy: '  ',
        supressEmptyNode: false,
      };

      if (outputDir) {
        // console.log('outputDir', outputDir);
        const attachmentsList: Attachment[] = [];
        this.findAttachments(outputDir[0], attachmentsList).then(
          (attachments) => {
            /*
            attachments.forEach(attachment => {
              console.log(attachment);
            });
            */

            xmlFiles.forEach((file) => {
              try {
                const json = parser.parse(
                  fs.readFileSync(file, 'utf8'),
                  options
                );
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

                    this.getAttachment(
                      attachments,
                      item.classname,
                      item.name
                    ).then((attachment) => {
                      if (attachment) {
                        result.resolved.push(attachment.attachmentPath);
                      }
                    });

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
            // console.log(result.resolved);
            // throw new Error('Stopping error');
          }
        );
      } else {
        resolve(undefined);
      }
    });
  }

  private uploadTestResults(
    args: Arguments,
    planId: number | undefined,
    matches: string[],
    milestoneId: number | undefined,
    attachments: AttachmentsResult | undefined
  ): Promise<any> {
    const url = `/plan/${planId}/junit_xml`;
    const data = new FormData();

    if (args.run_name) {
      data.append('run_name', args.run_name);
    }

    if (args.create_manual_run) {
      data.append('create_manual_run', args.create_manual_run ? 1 : 0);
    }

    if (matches.length > 1 || attachments) {
      let files = matches.map((f) => fs.createReadStream(f));

      if (attachments && attachments.resolved.length > 0) {
        logInfo('Resolved attachments:');
        console.log(attachments.resolved);
        files = files.concat(
          attachments.resolved.map((f) => fs.createReadStream(f))
        );
      }
      if (attachments && attachments.unresolved.length > 0) {
        logWarning('Unresolved attachments:');
        console.log(attachments.unresolved);
      }
      data.append('files[]', files);
      if (args.verbose) {
        console.log('Matching files: ', matches);
        console.log('Form data to send: ', files);
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
