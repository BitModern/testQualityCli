import { getResponse } from '@testquality/sdk';
import { Arguments, Argv } from 'yargs';
import * as fs from 'fs';
import * as path from 'path';
import FormData = require('form-data');
import { Command } from './Command';
import { logError } from './logError';
import asyncGlob from './asyncGlob';

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
      async (args: Arguments) => {
        try {
          const xmlFilesGlob = args.xmlfiles as string;
          const runResultOutputDir = args.run_result_output_dir as string;
          const ouputIsDir = fs
            .lstatSync(path.resolve(runResultOutputDir))
            .isDirectory();

          const runResultOutputDirGlob = ouputIsDir
            ? path.join(runResultOutputDir, '/**/*')
            : runResultOutputDir;

          if (!xmlFilesGlob) throw new Error('Must supply xmlfiles');

          const projectId = await this.getProjectId(args);
          const planId = await this.getId(args, 'plan', projectId);
          const milestoneId = await this.getId(
            args,
            'milestone',
            projectId,
            false
          );

          const xmlFiles = await asyncGlob(xmlFilesGlob, { realpath: true });
          let attachments;
          if (runResultOutputDirGlob) {
            console.log('file glob: ', runResultOutputDirGlob);
            attachments = await asyncGlob(runResultOutputDirGlob, {
              nodir: true,
            });
            console.log('Attachment files', attachments);
          }

          const response = await this.uploadTestResults(
            args,
            planId,
            xmlFiles,
            milestoneId,
            attachments
          );
          console.log(response);
        } catch (error) {
          logError(error);
        }
      }
    );
  }

  private uploadTestResults(
    args: Arguments,
    planId: number | undefined,
    xmlFiles: string[],
    milestoneId: number | undefined,
    attachments: string[] | undefined = []
  ): Promise<any> {
    if (!planId) throw new Error('Must supply plan id');

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

    const files = [...xmlFiles, ...attachments];

    if (files.length === 1) {
      data.append('file', fs.createReadStream(files[0]));
    } else {
      files.forEach((file) => {
        data.append('files[]', fs.createReadStream(file), path.basename(file));
      });

      if (args.verbose) {
        console.log('Matching files: ', xmlFiles);
      }
    }

    return getResponse(this.client.api, {
      url: `/plan/${planId}/junit_xml`,
      method: 'POST',
      data,
      headers: data.getHeaders(),
    });
  }
}
