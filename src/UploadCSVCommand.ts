import { Command } from './Command';
import { Arguments, Argv } from 'yargs';
import { logError } from './logError';
import { glob } from 'glob';
import * as fs from 'fs';
import FormData = require('form-data');
import { getResponse } from '@testquality/sdk';

export class UploadCSVCommand extends Command {
  constructor() {
    super(
      'upload_csv <file>',
      'CSV file Upload',
      (args: Argv) => {
        return args.positional('file', {
          describe: `global CSV file, example: upload_csv 'test_results.csv'`,
          type: 'string',
        });
      },
      (args: Arguments) => {
        this.reLogin(args).then(
          () => {
            if (args.file) {
              console.log(args.file);
              glob(args.file as string, { realpath: true }).then(
                (matches) => {
                  if (args.config_file) {
                    this.uploadCSVFile(
                      args,
                      matches,
                      args.config_file as string
                    ).then(
                      (response: any) => console.log(response),
                      (error: any) => logError(error)
                    );
                  } else {
                    logError('No config file was provided');
                  }
                },
                (err) => logError(err)
              );
            }
          },
          (error: any) => logError(error)
        );
      }
    );
  }

  private uploadCSVFile(
    args: Arguments,
    matches: string[],
    config: string
  ): Promise<any> {
    const url = `/import_data`;
    const data = new FormData();

    if (matches.length > 1) {
      data.append(
        'file',
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

    if (config) {
      data.append(
        'config',
        JSON.stringify(JSON.parse(fs.readFileSync(config, 'utf-8')))
      );
    } else {
      throw Error('Config file not found');
    }

    return getResponse<any>(this.client.api, {
      method: 'POST',
      url,
      data,
      headers: data.getHeaders(),
    });
  }
}
