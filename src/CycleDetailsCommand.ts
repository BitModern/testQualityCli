import { Command } from './Command';
import {
  planGetOne,
  runGetMany,
  planSuiteTestIncludeGetMany,
  type PlanApi,
  type RunApi,
  type RunResultApi,
  type PlanSuiteTestIncludeApi,
} from '@testquality/sdk';
import { logError } from './logError';
import { env } from 'env';

interface PartialRunResult {
  resultId: number;
  statusName: string;
  updatedAt: string;
  assignedToEmail: string;
}

interface PartialRun {
  runId: number;
  runName: string;
  isComplete: boolean;
  results: PartialRunResult[];
}

interface TestRunData {
  suiteId: number;
  suiteName: string;
  testId: number;
  testKey: number;
  testName: string;
  runs: PartialRun[];
}

interface PartialTest {
  id: number;
  key?: string;
  name?: string;
  runs: PartialRun[];
}
interface PartialSuite {
  id: number;
  name?: string;
  tests: PartialTest[];
}

export class CycleDetailsCommand extends Command {
  constructor() {
    super(
      'cycle_details',
      'Get cycle (plan) details with test runs and results',
      (args) => {
        return args
          .option('plan_id', {
            alias: ['pi', 'cycle_id', 'ci'],
            describe: 'Plan/Cycle ID',
            type: 'string',
          })
          .option('plan_name', {
            alias: ['pn', 'cycle_name', 'cn'],
            describe: 'Plan/Cycle Name',
            type: 'string',
          })
          .option('max_runs', {
            alias: 'mr',
            describe: 'Maximum number of runs to retrieve',
            type: 'number',
            default: 5,
          })
          .option('format', {
            alias: 'f',
            describe: 'Output format (json, md, csv, m)',
            type: 'string',
            default: 'json',
            choices: ['json', 'md', 'csv', 'm'],
          })
          .option('params', {
            alias: 'p',
            describe: 'Add Properties',
            type: 'array',
          });
      },
      async (args) => {
        try {
          // Step 1: Authentication & ID Resolution
          await this.reLogin(args);
          const projectId = await this.getProjectId(args);
          const planId = await this.getId(args, 'plan', projectId, true);
          if (!planId) {
            throw new Error('Plan ID is required.');
          }
          const maxRuns: number = (args.max_runs as number) || 5;
          const format = (args.format as string) || 'json';

          // Step 2: Fetch Plan Details
          const plan = await planGetOne(planId, {});

          // Step 3: Fetch Runs (Limited & Sorted)
          const runsResponse = await runGetMany({
            params: {
              plan_id: planId,
              _with:
                'runResult,runResult.status,runResult.userAssignedToTester',
              _sort: '-created_at',
              per_page: maxRuns,
            },
          });

          // Step 4: Fetch Plan Suite Test Includes
          const planSuiteTestIncludes = await planSuiteTestIncludeGetMany({
            params: {
              plan_id: planId,
              _with: 'suite,test',
              per_page: -1,
            },
          });

          // Step 5: Build Hierarchical Structure
          const testRunData = this.buildHierarchicalStructure(
            planSuiteTestIncludes.data,
            runsResponse.data,
          );

          // Step 6: Format Output
          const output = this.formatOutput(
            plan,
            testRunData,
            format,
            planId,
            maxRuns,
            (args.access_token as string | undefined) ??
              env.variables.accessToken,
          );
          console.log(output);
        } catch (error) {
          logError(error);
        }
      },
    );
  }

  private buildHierarchicalStructure(
    planSuiteTestIncludes: PlanSuiteTestIncludeApi[],
    runs: RunApi[],
  ): TestRunData[] {
    const testRunDataMap = new Map<number, TestRunData>();

    // Group by suites and tests
    for (const include of planSuiteTestIncludes) {
      const suite = include.suite!;
      const test = include.test!;

      if (!suite || !test) continue;

      const testId = test.id;

      if (!testRunDataMap.has(testId)) {
        testRunDataMap.set(testId, {
          suiteId: suite.id,
          suiteName: suite.name || 'Unknown Suite',
          testId,
          testKey: test.key || 0,
          testName: test.name || 'Unknown Test',
          runs: [],
        });
      }

      // Find runs with results for this test
      const testData = testRunDataMap.get(testId)!;

      for (const run of runs) {
        const runResults = run.run_result ?? ([] as RunResultApi[]);
        const testResults = runResults.filter(
          (result) => result.test_id === testId,
        );

        if (testResults.length > 0) {
          const runData = {
            runId: run.id,
            runName: run.name || '',
            isComplete: run.is_complete || false,
            results: testResults.map((result) => ({
              resultId: result.id,
              statusName: result.status?.name ?? 'Unknown Status',
              updatedAt: result.updated_at || '',
              assignedToEmail:
                (
                  result as RunResultApi & {
                    user_assigned_to_tester?: { email?: string };
                  }
                ).user_assigned_to_tester?.email ?? '',
            })),
          };

          testData.runs.push(runData);
        }
      }
    }

    // Convert to array and sort
    const testRunDataArray = Array.from(testRunDataMap.values());

    // Sort by suite (root first, then by sequence_plan) and test (by sequence_suite)
    testRunDataArray.sort((a, b) => {
      // For now, sort by suite name and test key
      // TODO: Implement proper sequence sorting when suite hierarchy is available
      if (a.suiteName !== b.suiteName) {
        return a.suiteName.localeCompare(b.suiteName);
      }
      return a.testKey - b.testKey;
    });

    return testRunDataArray;
  }

  private formatOutput(
    plan: PlanApi,
    testRunData: TestRunData[],
    format: string,
    planId?: number,
    maxRuns?: number,
    accessToken?: string,
  ): string {
    switch (format) {
      case 'md':
        return this.formatMarkdown(plan, testRunData);
      case 'csv':
        return this.formatCSV(plan, testRunData);
      case 'm':
        return this.formatMCode(planId, maxRuns, accessToken);
      case 'json':
      default:
        return this.formatJSON(plan, testRunData);
    }
  }

  private formatJSON(plan: PlanApi, testRunData: TestRunData[]): string {
    const output = {
      plan: {
        id: plan.id,
        name: plan.name,
      },
      suites: [] as PartialSuite[],
    };

    // Group by suite
    const suiteMap = new Map<number, PartialSuite>();

    for (const testData of testRunData) {
      if (!suiteMap.has(testData.suiteId)) {
        suiteMap.set(testData.suiteId, {
          id: testData.suiteId,
          name: testData.suiteName,
          tests: [] as PartialTest[],
        });
      }

      const suite = suiteMap.get(testData.suiteId)!;

      suite.tests.push({
        id: testData.testId,
        key: `TC-${testData.testKey}`,
        name: testData.testName,
        runs: testData.runs,
      });
    }

    output.suites = Array.from(suiteMap.values());

    return JSON.stringify(output, null, 2);
  }

  private formatMarkdown(plan: PlanApi, testRunData: TestRunData[]): string {
    let output = `# Plan: ${plan.name}\n\n`;
    output += `| Suite | Test | Run | Is Complete | Status | Updated At | Assigned To |\n`;
    output += `|-------|------|-----|-------------|--------|------------|-------------|\n`;

    for (const testData of testRunData) {
      const testDisplay = `TC-${testData.testKey} - ${testData.testName}`;

      if (testData.runs.length === 0) {
        output += `| ${testData.suiteName} | ${testDisplay} | - | - | - | - | - |\n`;
      } else {
        for (const run of testData.runs) {
          if (run.results.length === 0) {
            output += `| ${testData.suiteName} | ${testDisplay} | ${run.runName} | ${run.isComplete} | - | - | - |\n`;
          } else {
            for (const result of run.results) {
              output += `| ${testData.suiteName} | ${testDisplay} | ${run.runName} | ${run.isComplete} | ${result.statusName} | ${result.updatedAt} | ${result.assignedToEmail} |\n`;
            }
          }
        }
      }
    }

    return output;
  }

  private formatCSV(plan: PlanApi, testRunData: TestRunData[]): string {
    let output = `Suite,Test,Run,Is Complete,Status,Updated At,Assigned To\n`;

    for (const testData of testRunData) {
      const testDisplay = `TC-${testData.testKey} - ${testData.testName}`;

      if (testData.runs.length === 0) {
        output += `"${testData.suiteName}","${testDisplay}","","","","",""\n`;
      } else {
        for (const run of testData.runs) {
          if (run.results.length === 0) {
            output += `"${testData.suiteName}","${testDisplay}","${run.runName}","${run.isComplete}","","",""\n`;
          } else {
            for (const result of run.results) {
              output += `"${testData.suiteName}","${testDisplay}","${run.runName}","${run.isComplete}","${result.statusName}","${result.updatedAt}","${result.assignedToEmail}"\n`;
            }
          }
        }
      }
    }

    return output;
  }

  private formatMCode(
    planId?: number,
    maxRuns?: number,
    accessToken?: string,
  ): string {
    const apiUrl = env.api.url ?? 'https://api.testquality.com';
    const token = accessToken ?? 'YOUR_ACCESS_TOKEN';
    const planIdValue = planId ?? 'YOUR_PLAN_ID';
    const maxRunsValue = maxRuns ?? 5;

    return `let
    // Configuration
    ApiUrl = "${apiUrl}",
    AccessToken = "${token}",
    PlanId = ${planIdValue},
    MaxRuns = ${maxRunsValue},

    // Helper function to make API requests
    MakeRequest = (endpoint as text, params as record) =>
        let
            url = ApiUrl & endpoint,
            headers = [
                #"Authorization" = "Bearer " & AccessToken,
                #"Content-Type" = "application/json"
            ],
            queryString = Text.Combine(
                List.Transform(
                    Record.FieldNames(params),
                    each _ & "=" & Text.From(Record.Field(params, _))
                ),
                "&"
            ),
            fullUrl = if queryString = "" then url else url & "?" & queryString,
            response = Web.Contents(fullUrl, [Headers=headers]),
            json = Json.Document(response)
        in
            json,

    // Fetch Plan details
    PlanResponse = MakeRequest("/api/plan/" & Text.From(PlanId), []),
    PlanData = if PlanResponse[data]? <> null then PlanResponse[data] else PlanResponse,

    // Fetch Runs with related data
    RunsResponse = MakeRequest("/api/run", [
        plan_id = Text.From(PlanId),
        #"_with" = "runResult,runResult.status,runResult.userAssignedToTester",
        #"_sort" = "-created_at",
        per_page = Text.From(MaxRuns)
    ]),
    RunsData = if RunsResponse[data]? <> null then RunsResponse[data] else {},

    // Fetch Plan Suite Test Includes
    PlanSuiteTestIncludesResponse = MakeRequest("/api/plan_suite_test_include", [
        plan_id = Text.From(PlanId),
        #"_with" = "suite,test",
        per_page = "-1"
    ]),
    PlanSuiteTestIncludesData = if PlanSuiteTestIncludesResponse[data]? <> null
        then PlanSuiteTestIncludesResponse[data]
        else {},

    // Convert to tables
    RunsTable = Table.FromRecords(RunsData),
    IncludesTable = Table.FromRecords(PlanSuiteTestIncludesData),

    // Expand nested data in Runs
    RunsExpanded = if Table.HasColumns(RunsTable, "run_result") then
        Table.ExpandListColumn(RunsTable, "run_result")
    else
        RunsTable,

    RunsWithResults = if Table.HasColumns(RunsExpanded, "run_result") then
        Table.ExpandRecordColumn(
            RunsExpanded,
            "run_result",
            {"id", "test_id", "status", "updated_at", "user_assigned_to_tester"},
            {"result_id", "test_id", "result_status", "result_updated_at", "result_user"}
        )
    else
        Table.AddColumn(RunsExpanded, "result_id", each null),

    // Expand status if present
    RunsWithStatus = if Table.HasColumns(RunsWithResults, "result_status") then
        Table.ExpandRecordColumn(
            RunsWithResults,
            "result_status",
            {"name"},
            {"status_name"}
        )
    else
        Table.AddColumn(RunsWithResults, "status_name", each null),

    // Expand assigned user if present
    RunsWithUser = if Table.HasColumns(RunsWithStatus, "result_user") then
        Table.ExpandRecordColumn(
            RunsWithStatus,
            "result_user",
            {"email"},
            {"assigned_to_email"}
        )
    else
        Table.AddColumn(RunsWithStatus, "assigned_to_email", each null),

    // Expand suite and test in Includes
    IncludesWithSuite = if Table.HasColumns(IncludesTable, "suite") then
        Table.ExpandRecordColumn(
            IncludesTable,
            "suite",
            {"id", "name"},
            {"suite_expanded_id", "suite_name"}
        )
    else
        IncludesTable,

    IncludesWithTest = if Table.HasColumns(IncludesWithSuite, "test") then
        Table.ExpandRecordColumn(
            IncludesWithSuite,
            "test",
            {"id", "key", "name"},
            {"test_expanded_id", "test_key", "test_name"}
        )
    else
        IncludesWithSuite,

    // Join Includes with Runs on test_id (using the expanded test_id from test object)
    JoinedData = Table.NestedJoin(
        IncludesWithTest,
        {"test_expanded_id"},
        RunsWithUser,
        {"test_id"},
        "RunData",
        JoinKind.LeftOuter
    ),

    // Expand the joined run data
    ExpandedJoin = Table.ExpandTableColumn(
        JoinedData,
        "RunData",
        {"id", "name", "is_complete", "result_id", "status_name", "result_updated_at", "assigned_to_email"},
        {"run_id", "run_name", "is_complete", "result_id", "status_name", "result_updated_at_expanded", "assigned_to_email"}
    ),

    // Select and rename final columns
    FinalTable = Table.SelectColumns(
        ExpandedJoin,
        {"suite_name", "test_key", "test_name", "run_name", "is_complete", "status_name", "result_updated_at_expanded", "assigned_to_email"}
    ),

    // Add formatted test column
    WithFormattedTest = Table.AddColumn(
        FinalTable,
        "Test",
        each "TC-" & Text.From([test_key]) & " - " & [test_name]
    ),

    // Reorder columns
    ReorderedTable = Table.SelectColumns(
        WithFormattedTest,
        {"suite_name", "Test", "run_name", "is_complete", "status_name", "result_updated_at_expanded", "assigned_to_email"}
    ),

    // Rename columns to match output format
    RenamedTable = Table.RenameColumns(
        ReorderedTable,
        {
            {"suite_name", "Suite"},
            {"run_name", "Run"},
            {"is_complete", "Is Complete"},
            {"status_name", "Status"},
            {"result_updated_at_expanded", "Updated At"},
            {"assigned_to_email", "Assigned To"}
        }
    )
in
    RenamedTable`;
  }
}
