import * as Chalk from 'chalk';

const chalk = Chalk.default;

export const logError = (err: any) => {
  if (err.error) {
    console.log(chalk.red('Error'), `Status Code ${err.statusCode}`, err.error);
  } else {
    console.log(chalk.red('Error'), err);
  }
};
