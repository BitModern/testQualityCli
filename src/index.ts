import './env';
import * as yargs from 'yargs';
import { LoginCommand } from './LoginCommand';
import { ProjectCommand } from './ProjectCommand';
import { PlanCommand } from './PlanCommand';
import { MilestoneCommand } from './MilestoneCommand';
import { UploadTestRunCommand } from './UploadTestRunCommand';
import { UploadFeatureCommand } from './UploadFeatureCommand';
import { UploadCSVCommand } from './UploadCSVCommand';
import { CreateManualRunCommand } from './CreateManualRunCommand';
import { RestoreCommand } from './RestoreCommand';
import { CreatePlan } from './CreatePlan';
import { SuiteCommand } from './SuiteCommand';
import { TestCommand } from './TestCommand';

const argv = yargs
  .command(new LoginCommand())
  .command(new ProjectCommand())
  .command(new PlanCommand())
  .command(new SuiteCommand())
  .command(new MilestoneCommand())
  .command(new UploadTestRunCommand())
  .command(new UploadFeatureCommand())
  .command(new UploadCSVCommand())
  .command(new CreateManualRunCommand())
  .command(new RestoreCommand())
  .command(new CreatePlan())
  .command(new TestCommand())
  .option('verbose', {
    alias: 'v',
    boolean: true,
    type: 'boolean',
    default: false
  })
  .option('save', {
    alias: 's',
    describe: 'Save tokens for future use',
    boolean: true,
    type: 'boolean',
    default: false
  })
  .option('username', {
    alias: 'u',
    describe: 'User name you login as',
    type: 'string'
  })
  .option('access_token', {
    alias: 'at',
    describe: 'Access Token',
    type: 'string'
  })
  .option('expires_at', {
    alias: 'ea',
    describe: 'Access Token Expires at Unix Epoch',
    type: 'string'
  })
  .option('refresh_token', {
    alias: 'rt',
    describe: 'Refresh Token',
    type: 'string'
  })
  .option('project_id', {
    alias: 'i',
    describe: 'Project Id',
    type: 'string'
  })
  .option('project_name', {
    alias: 'n',
    describe: 'Project Name',
    type: 'string'
  })
  .option('milestone_id', {
    alias: 'mi',
    describe: 'Milestone ID',
    type: 'string'
  })
  .option('milestone_name', {
    alias: 'mn',
    describe: 'Milestone Name',
    type: 'string'
  })
  .option('plan_id', {
    alias: 'pi',
    describe: 'Plan ID',
    type: 'string'
  })
  .option('plan_name', {
    alias: 'pn',
    describe: 'Plan Name',
    type: 'string'
  })
  .option('run_name', {
    alias: 'rn',
    describe: 'Run name',
    type: 'string'
  })
  .option('run_result_output_dir', {
    alias: 'rr_output_dir',
    describe:
      'Run results output directory where potential attachments are located',
    type: 'string'
  })
  .option('config_file', {
    alias: 'cf',
    describe: 'CSV upload configuration file with data mapping information',
    type: 'string'
  })
  .demandCommand()
  .recommendCommands()
  .strict()
  .scriptName('testquality').argv;

if (!argv) {
  console.log('Arguments are undefined!');
}
