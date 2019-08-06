# TestQuality CLI

This command line interface allows you to upload your automated test results to TestQuality. Automated test results must be outputted in JUnit XML format, which most test automation tools will provide.

## Requirements

In order to upload xml you will need to:
1. Create a target Test Plan
2. Authenticate with TestQuality
3. Run command to upload files

# Compiled Commands

Under ["commands"](./commands) folder you will find command line programs for:
* Windows
* MacOS
* Linux
* Alpine

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

