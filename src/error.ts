import * as Chalk from 'chalk';

const chalk = Chalk.default;

export const logError = (err: any) => {
  console.log(chalk.red('Error'), err);
};
