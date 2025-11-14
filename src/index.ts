import './env';
import * as yargs from 'yargs';
import { LoginCommand } from './LoginCommand';
import { ProjectCommand } from './ProjectCommand';
import { PlanCommand } from './PlanCommand';
import { MilestoneCommand } from './MilestoneCommand';
import { UploadTestRunCommand } from './UploadTestRunCommand';
import { UploadFeatureCommand } from './UploadFeatureCommand';
import { UploadFeatureResultsCommand } from './UploadFeatureResultsCommand';
import { UploadCSVCommand } from './UploadCSVCommand';
import { CreateManualRunCommand } from './CreateManualRunCommand';
import { RestoreCommand } from './RestoreCommand';
import { CreatePlan } from './CreatePlan';
import { SuiteCommand } from './SuiteCommand';
import { TestCommand } from './TestCommand';
import { RunCommand } from './RunCommand';
import { DefectCommand } from './DefectCommand';
import { RequirementCommand } from './RequirementCommand';
import { PlanSuiteCommand } from './PlanSuiteCommand';
import { SuiteTestCommand } from './SuiteTestCommand';
import { PlanDelete } from './PlanDeleteCommand';

const argv = yargs
  .command(new CreateManualRunCommand())
  .command(new CreatePlan())
  .command(new DefectCommand())
  .command(new LoginCommand())
  .command(new MilestoneCommand())
  .command(new ProjectCommand())
  .command(new PlanCommand())
  .command(new PlanDelete())
  .command(new PlanSuiteCommand())
  .command(new RestoreCommand())
  .command(new RequirementCommand())
  .command(new RunCommand())
  .command(new SuiteCommand())
  .command(new SuiteTestCommand())
  .command(new TestCommand())
  .command(new UploadTestRunCommand())
  .command(new UploadFeatureCommand())
  .command(new UploadFeatureResultsCommand())
  .command(new UploadCSVCommand())
  .option('verbose', {
    alias: 'v',
    boolean: true,
    type: 'boolean',
    default: false,
  })
  .option('save', {
    alias: 's',
    describe: 'Save tokens for future use',
    boolean: true,
    type: 'boolean',
    default: false,
  })
  .option('username', {
    alias: 'u',
    describe: 'User name you login as',
    type: 'string',
  })
  .option('access_token', {
    alias: ['t', 'at'], // Multiple aliases as an array
    describe: 'Access Token',
    type: 'string',
  })
  .option('expires_at', {
    alias: 'ea',
    describe: 'Access Token Expires at Unix Epoch',
    type: 'string',
  })
  .option('refresh_token', {
    alias: 'rt',
    describe: 'Refresh Token',
    type: 'string',
  })
  .option('project_id', {
    alias: 'i',
    describe: 'Project Id',
    type: 'string',
  })
  .option('project_name', {
    alias: 'n',
    describe: 'Project Name',
    type: 'string',
  })
  .demandCommand()
  .recommendCommands()
  .strict()
  .scriptName('testquality').argv;

if (!argv) {
  console.log('Arguments are undefined!');
}
