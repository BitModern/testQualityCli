# TestQuality CLI

The TestQuality CLI is a robust, command-line tool designed to streamline your testing workflows with TestQuality projects. It helps you to programmatically interact with TestQuality organize your testing efforts and upload your automated test results from CI/CD pipelines or your local development environment

## Prerequisites

Before you begin, ensure you have the following:

1.  **Node.js and npm:** Required for the primary installation method.
2.  **A TestQuality Account:** You'll need credentials to log in.
3.  **A Target Cycle in TestQuality:** Create a Cycle in your TestQuality Project where you intend to upload results.
4.  **Automated Test Results:** Your test automation framework should produce results in JUnit XML format.

## Installation

Install the TestQuality CLI globally using `npm` (or your preferred Node.js package manager):

```sh
npm install -g @testquality/cli
```

After installation, you can run the CLI using the `testquality` command.

### Alternative: Standalone Binary

If you prefer not to use `npm` or need a standalone executable, you can download compiled binaries. These are larger as they include the Node.js runtime.

**Download**

Download the binary from [cli.testquality.com](http://cli.testquality.com/) or directly from GitHub releases:

```sh
wget https://github.com/BitModern/testQualityCli/releases/download/{{ version }}/testquality-linux -O testquality
```

Replace `{{ version }}` with the actual release tag (e.g., `v1.0.0`) and adjust the filename based on your operating system:

- Windows: `testquality-win.exe`
- MacOS: `testquality-macos`
- Linux: `testquality-linux`
- Alpine Linux: `testquality-alpine`

**Set Permissions**

Once downloaded, grant execute permissions:

```sh
chmod 744 testquality
```

For easier access, consider moving the binary to a directory in your PATH (e.g., `/usr/local/bin` for Linux/MacOS).

**Note for Alpine Linux:** If using the standalone binary on Alpine Linux, you must install `libstdc++`:

```sh
apk add --no-cache libstdc++
```

## Authentication

You need to authenticate with TestQuality to use the CLI.

### 1. Login with Email and Password

Use the `login` command with your TestQuality email and password.

```sh
testquality login your_email@example.com YourPassword
```

**Save Credentials:**
To avoid logging in repeatedly, include the `--save` flag. This will store your authentication token locally for subsequent commands.

```sh
testquality login your_email@example.com YourPassword --save
```

### 2. Personal Access Token (PAT)

You can also authenticate using a Personal Access Token (PAT).

**Option A: Environment Variable**
Set the `TQ_ACCESS_TOKEN` environment variable:

```sh
export TQ_ACCESS_TOKEN=your_personal_access_token
```

The CLI will automatically pick up this variable.

**Option B: Command Line Argument**
Add the `--access_token=<YOUR_PAT>` argument to any command:

```sh
testquality upload_test_run 'path/to/*.xml' --project_name=MyProject --plan_name=MyPlan --access_token=your_personal_access_token
```

## Core Usage: Uploading Test Results

This is the primary function of the CLI. Ensure your test results are in JUnit XML format.

### Basic Upload

```sh
testquality upload_test_run 'sampleXml/*.xml' --project_name="Your Project Name" --plan_name="Your Cycle Name"
```

- Replace `'sampleXml/*.xml'` with the glob pattern matching your JUnit XML files.
- Replace `"Your Project Name"` and `"Your Cycle Name"` with the actual names from your TestQuality instance.

### Including Attachments

Attach files like screenshots or logs to your test results.

- **From Test Name Tag:** `[[ATTACHMENT|ScreenshotFileName.png]]`
  - Example: `Test with UI screenshot [[ATTACHMENT|error_screenshot.png]]`
- **From Console Output:** `[[ATTACHMENT|path/to/your/file.log]]`
  - Example: If your test prints `[[ATTACHMENT|logs/test_run_details.log]]` to console output.

**Important:** When using attachments, you **must** specify the root directory where these attachment files are located using the `run_result_output_dir` option:

```sh
testquality upload_test_run 'output/results/*.xml' --project_name="MyProject" --plan_name="MainCycle" --run_result_output_dir="output/attachments_and_logs/"
```

In this example, if a test tag mentions `[[ATTACHMENT|error_screenshot.png]]`, the CLI will look for `output/attachments_and_logs/error_screenshot.png`. If console output mentions `[[ATTACHMENT|logs/test_run_details.log]]`, it will look for `output/attachments_and_logs/logs/test_run_details.log`.

### Linking Defects

You can link test results to defects in GitHub or Jira directly from your test reports. Modify your test names or include console output within your tests using the following formats:

- **GitHub Defects:** `[[DEFECT|GH_ISSUE_NUMBER]]`
  - Example: `My Test Case [[DEFECT|22]]`
- **Jira Defects:** `[[DEFECT|JIRA_ISSUE_KEY]]`
  - Example: `Another Test Scenario [[DEFECT|TQ-123]]`

The CLI will parse these tags and create the necessary links in TestQuality.

## Other Common Commands

### Upload CSV Files

For specific scenarios, you might need to upload results via CSV:

```sh
testquality upload_csv ./test_run_results.csv --cf ./test_run_results.config
```

(Ensure you have the corresponding config file for your CSV structure.)

## Getting Help

To see a list of all available commands:

```sh
testquality --help
```

For help with a specific command (e.g., `login`):

```sh
testquality login --help
```

## Advanced Usage

### Restoring a Plan or Suite

This section is for recovering deleted items.

**Restore a Plan:**

1.  Login (if you haven't already).
2.  List deleted plans:
    ```sh
    testquality plans --revision_log -p _sort=-updated_at -p operation=delete
    ```
3.  Restore the plan using its ID:
    ```sh
    testquality restore --plan_id <PLAN_ID>
    ```

**Restore a Suite:**

1.  Login.
2.  List deleted suites:
    ```sh
    testquality suites --revision_log -p _sort=-updated_at -p operation=delete
    ```
3.  Find associated plans for the deleted suite:
    ```sh
    testquality plan_suite --revision_log -p _sort=-updated_at -p operation=delete -p suite_id=<SUITE_ID>
    ```
4.  Restore the suite with its ID and an associated plan ID:
    ```sh
    testquality restore --suite_id <SUITE_ID> --plan_id <ASSOCIATED_PLAN_ID>
    ```

### Using Custom Parameters

You can pass additional parameters to the API using the `--params` prefix:

```sh
testquality some_command --params.per_page -1 --params._with test
```

This translates to API parameters: `{per_page: -1, _with: 'test'}`

## Contributing (For Developers)

If you want to contribute to the development of the TestQuality CLI itself:

### Development Environment

The project uses Yarn for dependency management. You'll need Node.js and Yarn installed.

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```sh
    yarn install
    ```

**Running in Development Mode (with watch):**
This command will watch for file changes and automatically rebuild.

```sh
yarn dev
```

**Running a Specific Command Directly (without watch):**
Use `yarn start` followed by the command and its arguments.

```sh
yarn start login <username> <password>
```

(Replace `<username>` and `<password>` or other command arguments as needed.)

**Building for Production:**
This command builds the project for production (creates the binaries mentioned in the alternative installation).

```sh
yarn build
```
