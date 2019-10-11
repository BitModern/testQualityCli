import * as Chalk from 'chalk';

const chalk = Chalk.default;

export const logInfo = (message: any) => {
  console.log(chalk.blue('Info:'), message);
};
