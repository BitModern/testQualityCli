import { getResponse } from '@testquality/sdk';
import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import FormData = require('form-data');
import { Command } from './Command';
import { Arguments, Argv } from 'yargs';
import { logError } from './logError';

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
                        (err, xmlfiles) => {
                          if (err) {
                            logError(err);
                          } else {
                            if (args.run_result_output_dir) {
                              console.log('file glob: ', args.run_result_output_dir);
                              glob(
                                args.run_result_output_dir as string,
                                {},
                                (errors, attachments) => {
                                  console.log('Attachment files', attachments);
                                  if (errors) {
                                    logError(errors);
                                  }
                                  this.uploadTestResults(
                                    args,
                                    planId,
                                    xmlfiles,
                                    milestoneId,
                                    attachments
                                  ).then(
                                    (response: any) =>
                                      console.log(response),
                                    (error: any) => logError(error)
                                  );
                                }
                              );
                            } else {
                              this.uploadTestResults(
                                args,
                                planId,
                                xmlfiles,
                                milestoneId,
                                undefined
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

  private uploadTestResults(
    args: Arguments,
    planId: number | undefined,
    xmlFiles: string[],
    milestoneId: number | undefined,
    attachments: string[] | undefined
  ): Promise<any> {
    if (planId === undefined) {
      throw new Error('Must supply plan id');
    }
    const url = `/plan/${planId}/junit_xml`;
    const data = new FormData();

    if (args.run_name) {
      data.append('run_name', args.run_name);
    }
    if (milestoneId) {
      data.append('milestone_id', milestoneId);
    }
    if (args.create_manual_run) {
      data.append('create_manual_run', args.create_manual_run ? 1 : 0);
    }

    if (xmlFiles.length === 1 && (attachments === undefined || attachments.length === 0)) {
      data.append('file', fs.createReadStream(xmlFiles[0]));
    } else {
      xmlFiles.map((xmlFile) => {
        data.append('files[]', fs.createReadStream(xmlFile), path.basename(xmlFile));
      });

      if (attachments) {
        attachments.map((attachment) => {
          data.append('files[]', fs.createReadStream(attachment), path.basename(attachment));
        });
      }

      if (args.verbose) {
        console.log('Matching files: ', xmlFiles);
      }
    }

    return getResponse(this.client.api, {
      url,
      method: 'POST',
      data,
      headers: data.getHeaders(),
    });
  }
}
