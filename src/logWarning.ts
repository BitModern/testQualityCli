import * as Chalk from 'chalk';

const chalk = Chalk.default;

export const logWarning = (message: any) => {
  console.log(chalk.yellow('Warning:'), message);
};
