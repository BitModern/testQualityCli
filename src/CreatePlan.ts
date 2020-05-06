import { Command } from './Command';
import { Arguments, Argv } from 'yargs';
import { logError } from './error';
import { tqPost } from './tqRequest';
import { IPlanResource } from './PlanCommand';

/**
 * Copyright (C) 2019 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Created by jamespitts on 12/31/19.
 */

export class CreatePlan extends Command {
  constructor() {
    super(
      'create_plan <name>',
      'Create a Test Plan without uploading test results',
      (args: Argv) => {
        return args
          .positional('name', {
            describe: 'Name of plan',
            type: 'string'
          })
          .option('duplicates', {
            describe: `Number of items to create`,
            type: 'number'
          });
      },
      (args: Arguments) => {
        this.auth.update(args).then(accessToken => {
          if (!this.auth.projectId) {
            logError(
              'Project is required. Try adding "--project_name=<name>" or "--project_id=<number>"'
            );
            return;
          }
          if (!args.name) {
            logError('Plan name is required.');
            return;
          }
          const formData = {
            project_id: this.auth.projectId,
            name: args.name
          };
          if (args.duplicates) {
            const duplicates: number = args.duplicates as number;
            for (let idx = 0; idx < duplicates; idx += 1) {
              formData.name = args.name + ' ' + idx.toString(10);
              tqPost<IPlanResource>(accessToken, '/plan', formData).then(
                plan => {
                  console.log(plan);
                },
                error => logError(error)
              );
            }
          } else {
            tqPost<IPlanResource>(accessToken, '/plan', formData).then(
              plan => {
                console.log(plan);
              },
              error => logError(error)
            );
          }
        });
      }
    );
  }
}
