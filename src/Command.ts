import { Arguments, Argv } from 'yargs';
import { env } from './env';
import { Auth } from './Auth';
import * as Chalk from 'chalk';

const chalk = Chalk.default;

export class Command {
  public auth = new Auth();

  constructor(
    public command: string,
    public description: string,
    public subBuilder: (args: Argv) => Argv,
    public subHandler: (args: Arguments) => void
  ) {}

  public builder = (args: Argv): Argv => {
    return this.subBuilder(args);
  };
  public handler = (args: Arguments): void => {
    if (args.verbose) {
      console.log(chalk.blue(`TestQuality Host: ${env.host}`));
      console.log(chalk.blue('Current path ' + process.cwd()));
    }
    this.subHandler(args);
  };
}
