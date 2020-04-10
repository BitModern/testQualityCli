import { Command } from './Command';
import { Arguments, Argv } from 'yargs';
import { env } from './env';
import { logError } from './error';
import * as request from 'request-promise-native';
import * as glob from 'glob';
import * as fs from 'fs';

export class UploadCSVCommand extends Command {
  constructor() {
    super(
      'upload_csv <file>',
      'CSV file Upload',
      (args: Argv) => {
        return args.positional('file', {
          describe: `glob CSV file, example: upload_csv 'test_results.csv'`,
          type: 'string'
        });
      },
      (args: Arguments) => {
        this.auth.update(args).then(
          accessToken => {
            if (args.file) {
              glob(args.file as string, { realpath: true }, (err, matches) => {
                if (err) {
                  logError(err);
                } else {
                  if (args.config_file) {
                    this.uploadCSVFile(
                      args,
                      accessToken,
                      matches,
                      args.config_file as string
                    ).then(
                      (response: any) => console.log(response),
                      (error: any) => logError(error)
                    );
                  } else {
                    logError('No config file was provided');
                  }
                }
              });
            }
          },
          (error: any) => logError(error)
        );
      }
    );
  }

  private uploadCSVFile(
    args: Arguments,
    accessToken: string,
    matches: string[],
    config: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = `${env.host}/import_data`;
      const formData: any = {};

      if (matches.length > 1) {
        formData.file = matches.map(f => fs.createReadStream(f));
        if (args.verbose) {
          console.log('Matching files: ', matches);
          console.log('Form data to send: ', formData);
        }
      } else if (matches.length === 1) {
        formData.file = fs.createReadStream(matches[0]);
      } else {
        throw Error('No matching files');
      }

      if (config) {
        formData.config = JSON.stringify(
          JSON.parse(fs.readFileSync(config, 'utf-8'))
        );
        // console.log(formData.config);
      } else {
        throw Error('Config file not found');
      }

      const options = {
        method: 'POST',
        url,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.testquality.v1+json',
          'Content-Type': 'multipart/form-data'
        },
        formData,
        json: true // Automatically parses the JSON string in the response
      };

      // console.log('formData', formData);
      // throw Error('Stoping request');

      return request(options).then((body: any) => {
        resolve(body);
      }, reject);
    });
  }
}
