# TestQuality CLI

This command line interface allows you to upload your automated test results to TestQuality. Automated test results must be outputted in JUnit XML format, which most test automation tools will provide. Test result attachments and related defects are also supported through test name tags or console outputs.

For DEFECTS we expect the following tag format for both test name tags and console ouptuts.

- GitHub Defects [[DEFECT|22]]
- Jira Defects [[DEFECT|TQ-123]]

For ATTACHMENTS the following format is expected:

- Attachments from test name tag [[ATTACHMENT|ScreenshotFileName.png]]
- Attachments from console output [[ATTACHMENT|path/to/file]]

Note that for attachment you will need to use 'run_result_output_dir' option to specify the test result output directory.

## Requirements

In order to upload xml you will need to:

1. Create a target Test Plan
2. Authenticate with TestQuality
3. Run command to upload files

# Compiled Commands

There are compiled commands for

- Windows
- MacOS
- Linux
- Alpine

Commands can be downloaded from [cli.testquality.com](http://cli.testquality.com)

Note: For _alpine_ you must install libstdc++

```sh
apk add --no-cache libstdc++
```

# Usage

For list of commands

```sh
yarn start --help
```

or

```sh
testquality-macos --help
```

For command help

```sh
yarn start login --help
```

or

```sh
testquality-macos login --help
```

# Save

Include `--save` to save tokens to use with other commands.

# Example

Example workflow.

```sh
testquality-macos login larry@bitmodern.com *password* --save
testquality-macos upload_test_run 'sample/XmlFiles/*.xml' --project_name=Test --plan_name=Test
```

You can also create a manual test plan run.

```sh
testquality-macos create_manual_run --project_name=My_Project --plan_name=My_Test_Plan --run_name=Test_Run_Name
```

CSV Files

```sh
testquality-macos upload_csv ./test_run_results.csv --cf ./test_run_results.config
```

Personal Access Token (PAT)

Add the `--access_token=pat` where pat equals token to any command.

Or

Save token into .env or environment with `TQ_ACCESS_TOKEN=pat` where pat equals token

# Contributing

## Development

### Running in Development Mode

To run the project in development mode (with watch mode enabled):

```sh
yarn dev
```

This command will watch for file changes and automatically rebuild

### Running Directly

To run a specific command without watching for changes:

```sh
yarn start login <username> <password>
```

### Building for Production

To build the project for production:

```sh
yarn build
```

## Docker

Retrieve an authentication token and authenticate your Docker client to your registry.
Use the AWS CLI:

```sh
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 092049816521.dkr.ecr.us-east-1.amazonaws.com/test-quality-cli
```

Note: If you receive an error using the AWS CLI, make sure that you have the latest version of the AWS CLI and Docker installed.

Build your Docker image using the following command. For information on building a Docker file from scratch see the instructions [here](http://docs.aws.amazon.com/AmazonECS/latest/developerguide/docker-basics.html)

```sh
docker build -t test-quality-cli .
```

Run your Docker image local.

```sh
docker run --name test-quality-cli -p 80:80 --rm test-quality-cli
```

After the build completes, tag your image so you can push the image to this repository:

```sh
docker tag test-quality-cli:latest 092049816521.dkr.ecr.us-east-1.amazonaws.com/test-quality-cli:latest
```

Run the following command to push this image to your newly created AWS repository:

```sh
docker push 092049816521.dkr.ecr.us-east-1.amazonaws.com/test-quality-cli:latest
```

Kubernetes

```sh
kustomize build kustomize/overlays/<<environment>> | kubectl apply --dry-run --validate -f -

kustomize build kustomize/overlays/<<parameters.environment>> | kubectl apply --record=true -f -
```

## Restoring a plan or suite

For Plan

1. Login
2. List plans that have been deleted

```sh
testquality-macos plans --revision_log -p \_sort=-updated_at -p operation=delete
```

3. Restore

```sh
testquality-macos restore --plan_id 17452
```

For Suite

1. Login
2. List suites that have been deleted

```sh
testquality-macos suites --revision_log -p \_sort=-updated_at -p operation=delete
```

3. Find associated plans

```sh
testquality-macos plan_suite --revision_log -p \_sort=-updated_at -p operation=delete -p suite_id=105923
```

4. Restore

```sh
testquality-macos restore --suite_id 105923 --plan_id 17452
```

## Calling with params

```
--params.per_page -1 --params.\_with test
// gives us: {per_page: -1, with: 'test'}
```
