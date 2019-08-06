import { Command } from './Command';
import { logError } from './error';
import { env } from './env';
import * as request from 'request-promise-native';

export class RestoreCommand extends Command {
  constructor() {
    super(
      'restore',
      'Restore plan or test.',
      args => {
        return args
          .option('test_id', {
            alias: 'ti',
            describe: 'Test ID',
            type: 'string'
          })
          .option('suite_id', {
            alias: 'si',
            describe: 'Suite to restore test in, optional',
            type: 'string'
          });
      },
      args => {
        this.auth.update(args).then(
          accessToken => {
            if (!this.auth.projectId) {
              logError(
                'Project is required. Try adding "--project_name=<name>" or "--project_id=<number>"'
              );
            } else {
              if (args.plan_id) {
                this.postRestore('plan', accessToken, args.plan_id as string).then(
                  response => console.log(response),
                  error => logError(error)
                );
              } else if (args.test_id) {
                const options = args.suite_id
                  ? { suite_id: args.suite_id }
                  : undefined;
                this.postRestore('test', accessToken, args.test_id as string, options).then(
                  response => console.log(response),
                  error => logError(error)
                );
              } else {
                logError(
                  `plan or test is required. Try adding "--plan_id=<number>" or "--test_id=<number>`
                );
              }
            }
          },
          error => logError(error)
        );
      }
    );
  }

  private postRestore(type: string, accessToken: string, id: string, body?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = `${env.host}/${type}/${id}/restore?XDEBUG_SESSION_START=PHPSTORM`;
      const options = {
        method: 'POST',
        url,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'content-type': 'application/json'
        },
        body,
        json: true // Automatically parses the JSON string in the response
      };
      return request(options).then((body: any) => {
        resolve(body);
      }, reject);
    });
  }
}
