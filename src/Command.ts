import { Arguments, Argv } from 'yargs';
import { env } from './env';
import { UpdateAuth } from './UpdateAuth';
import { logger } from './Logger';

export class Command {
  public auth = new UpdateAuth();

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
      logger.info(`TestQuality Host: ${env.api.url}`);
      logger.info('Current path ' + process.cwd());
    }
    this.subHandler(args);
  };
}
