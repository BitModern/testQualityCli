import { getResponse } from '@testquality/sdk';
import { type Arguments, type Argv } from 'yargs';
import * as fs from 'fs';
import * as path from 'path';
import FormData = require('form-data');
import { Command } from './Command';
import { logError } from './logError';
import { glob } from 'glob';

export class UploadTestRunCommand extends Command {
  constructor() {
    super(
      'upload_test_run <xmlfiles>',
      'JUnit/XUnit XML Upload',
      (args: Argv) => {
        return args
          .positional('xmlfiles', {
            describe: `glob JUnit/XUnit XML output file, example: upload_test_run '**/*.xml'`,
            type: 'string',
          })
          .option('milestone_id', {
            alias: 'mi',
            describe: 'Milestone ID',
            type: 'string',
          })
          .option('plan_id', {
            alias: 'pi',
            describe: 'Plan ID',
            type: 'string',
          })
          .option('plan_name', {
            alias: 'pn',
            describe: 'Plan Name',
            type: 'string',
          })
          .option('run_name', {
            alias: 'rn',
            describe: 'Run name',
            type: 'string',
          })
          .option('run_result_output_dir', {
            alias: 'rr_output_dir',
            describe:
              'Run results output directory where potential attachments are located',
            type: 'string',
          })
          .option('folder_id', {
            alias: 'fi',
            describe: 'Folder id',
            type: 'string',
          })
          .option('version2', {
            alias: 'v2',
            describe: 'Version 2 of Upload',
            boolean: true,
            type: 'boolean',
            default: false,
          })
          .option('delimiter', {
            alias: 'd',
            describe: 'Delimiter',
            type: 'string',
          });
      },
      async (args: Arguments) => {
        try {
          const xmlFilesGlob = args.xmlfiles as string;
          const runResultOutputDir = args.run_result_output_dir as string;
          const outputIsDir =
            runResultOutputDir &&
            fs.lstatSync(path.resolve(runResultOutputDir)).isDirectory();

          const runResultOutputDirGlob = outputIsDir
            ? path.join(runResultOutputDir, '/**/*')
            : runResultOutputDir;

          if (!xmlFilesGlob) throw new Error('Must supply xmlfiles');

          const projectId = await this.getProjectId(args);
          const planId = await this.getId(args, 'plan', projectId, false);
          const milestoneId = await this.getId(
            args,
            'milestone',
            projectId,
            false,
          );

          const xmlFiles = await glob(xmlFilesGlob, { realpath: true });
          if (args.verbose) {
            console.log('XML Glob: ', xmlFilesGlob);
            console.log('Matching files: ', xmlFiles);
          }
          let attachments;
          if (runResultOutputDirGlob) {
            console.log('file glob: ', runResultOutputDirGlob);
            attachments = await glob(runResultOutputDirGlob, {
              nodir: true,
            });
            console.log('Attachment files', attachments);
          }

          const response = await this.uploadTestResults(
            args,
            xmlFiles,
            attachments,
            projectId,
            planId,
            milestoneId,
          );
          console.log(response);
        } catch (error) {
          logError(error);
        }
      },
    );
  }

  private async uploadTestResults(
    args: Arguments,
    xmlFiles: string[],
    attachments: string[] = [],
    projectId?: number,
    planId?: number,
    milestoneId?: number,
  ): Promise<any> {
    const data = new FormData();

    if (projectId) {
      data.append('project_id', projectId);
    }
    if (planId) {
      data.append('plan_id', planId);
    } else if (args.plan_name) {
      data.append('plan_name', args.plan_name);
    }
    if (args.run_name) {
      data.append('run_name', args.run_name);
    }
    if (milestoneId) {
      data.append('milestone_id', milestoneId);
    }
    if (args.create_manual_run) {
      data.append('create_manual_run', args.create_manual_run ? 1 : 0);
    }
    if (args.folder_id) {
      data.append('suite_id', args.folder_id);
    }

    if (args.delimiter) {
      data.append('delimiter', args.delimiter);
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

    if (args.verbose) {
      console.log('using new version of upload: ', args.version2);
    }
    const url = args.version2 ? '/import_xml' : '/junit_xml';

    return await getResponse(this.client.api, {
      url,
      method: 'POST',
      data,
      headers: data.getHeaders(),
    });
  }
}
