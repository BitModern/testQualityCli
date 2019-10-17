# TestQuality CLI

This command line interface allows you to upload your automated test results to TestQuality. Automated test results must be outputted in JUnit XML format, which most test automation tools will provide. Test result attachments and related defects are also supported through test name tags or console outputs.

For DEFECTS we expect the following tag format for both test name tags and console ouptuts.
 - GitHub Defects [[DEFECT|22]]
 - Jira Defects [[DEFECT|TQ-123]]

 For ATTACHMENTS the following format is expected:
 - Attachments from test name tag [[ATTACHMENT|ScreenshotFileName.png]]
 - Attachments from console output [[ATTACHMENT|path/to/file]]

 Note that for attachment test name tag usage you will neet to use 'run_result_output_dir' option to specify the test result output directory.

## Requirements

In order to upload xml you will need to:
1. Create a target Test Plan
2. Authenticate with TestQuality
3. Run command to upload files

# Compiled Commands

There are compiled commands for 
* Windows
* MacOS
* Linux
* Alpine

Commands can be downloaded from [cli.testquality.com](http://cli.testquality.com)

Note: For *alpine* you must install libstdc++

    apk add --no-cache libstdc++

# Usage

For list of commands

    yarn start --help
   
or

    testquality-macos --help
    
For command help

    yarn start login --help

or

    testquality-macos login --help
 
 # Save
 
 Include ```--save``` to save tokens to use with other commands.
 
 # Example
 
 Example workflow.
 
    testquality-macos login larry@bitmodern.com *password* --save
    testquality-macos upload_test_run 'sampleXml/*.xml' --project_name=Test --plan_name=Test
    
 # Contributing
 
 ## Build
    yarn
    yarn build
 
 ## Running
    yarn start login <username> <password>
    
 ## Packaging Commands
    yarn package
    
 ## Development
    yarn serve

