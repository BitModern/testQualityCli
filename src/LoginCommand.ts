import { Command } from './Command';
import { saveEnv } from './env';
import { logError } from './logError';
import { Arguments, Argv } from 'yargs';

export class LoginCommand extends Command {
  constructor() {
    super(
      'login <username> <password>',
      'Login to TestQuality',
      (args: Argv) => {
        return args
          .positional('username', {
            describe: 'User name you login as',
            type: 'string',
          })
          .positional('password', {
            describe: 'Password for user',
            type: 'string',
          })
          .option('properties', {
            alias: 'prop',
            describe: 'Add Properties',
            type: 'string',
          });
      },
      (args: Arguments) => {
        if (args.username && args.password) {
          const prop = args.properties
            ? JSON.parse(args.properties as string)
            : undefined;
          this.auth
            .login(args.username as string, args.password as string, prop)
            .then(
              (body) => {
                if (args.save) {
                  saveEnv();
                }
                console.log(body);
              },
              (error: any) => {
                logError(error);
              }
            );
        }
      }
    );
  }
}
