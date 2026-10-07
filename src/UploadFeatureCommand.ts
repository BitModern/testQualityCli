import { Command } from './Command';
import { type Arguments, type Argv } from 'yargs';
import { logError, markReported } from './logError';
import { glob } from 'glob';
import * as crypto from 'crypto';
import FormData from 'form-data';
import { getResponse } from '@testquality/sdk';
import { logger } from './Logger';
import {
  formatMB,
  MAX_BYTES_PER_REQUEST,
  MAX_FILES_PER_REQUEST,
} from './uploadFiles';
import {
  appendSnapshots,
  batchFeatureFiles,
  listFeatureFiles,
  manifestDigest,
  readSnapshots,
  type UploadedFile,
} from './featureSnapshot';
import { type ScenarioReport, writeTags } from './writeTags';

export class UploadFeatureCommand extends Command {
  constructor() {
    super(
      'upload_feature <files>',
      'Gherkin feature files Upload',
      (args: Argv) => {
        return args
          .positional('files', {
            describe: `glob Gherkin feature file, example: upload_feature '**/*.feature'`,
            type: 'string',
          })
          .option('plan_id', {
            alias: 'pi',
            describe: 'Plan ID',
            type: 'string',
          })
          .option('plan_name', {
            alias: 'pn',
            describe: 'Plan Name',
            type: 'string',
          })
          .option('automation_id', {
            alias: 'ai',
            describe: 'Automation ID',
            type: 'string',
          })
          .option('automation_name', {
            alias: 'an',
            describe: 'Automation Name',
            type: 'string',
          })
          .option('folder_id', {
            alias: 'fi',
            describe: 'Folder id',
            type: 'string',
          })
          .option('batch_size', {
            describe: `Files sent per request (1-${MAX_FILES_PER_REQUEST}); larger sets are uploaded in sequential batches`,
            type: 'number',
            default: MAX_FILES_PER_REQUEST,
          })
          .option('sync', {
            describe:
              'Keep --folder_id in step with these files: removed scenarios are archived once every batch has arrived',
            type: 'boolean',
          })
          .option('force', {
            describe:
              'With --sync: archive even when more is removed than the safety threshold allows',
            type: 'boolean',
          })
          .option('dry-run', {
            describe:
              'With --sync: report what would be archived and change nothing. With --write_tags: list the tags and write no file',
            type: 'boolean',
          })
          .option('write_tags', {
            describe:
              "Import, then write each scenario's @TC<key> tag into its .feature file (a one-time local step; review and commit the result)",
            type: 'boolean',
          })
          .option('base_dir', {
            describe:
              'Directory the reported file paths are relative to (default: the current directory)',
            type: 'string',
          });
      },
      async (args: Arguments) => {
        try {
          this.validateFlags(args);
          const projectId = await this.getProjectId(args);

          if (args.files) {
            const matches = await glob(args.files as string, {
              realpath: true,
            });
            const response = await this.uploadFeatureFiles(
              args,
              matches,
              projectId,
            );
            printSummary(response, args);
          }
        } catch (error) {
          logError(error);
        }
      },
    );
  }

  private buildForm(args: Arguments, projectId?: number): FormData {
    const data = new FormData();

    if (projectId) {
      data.append('project_id', projectId);
    }
    if (args.plan_id) {
      data.append('plan_id', args.plan_id);
    } else if (args.plan_name) {
      data.append('plan_name', args.plan_name);
    } else if (args.automation_id) {
      data.append('automation_id', args.automation_id);
    } else if (args.automation_name) {
      data.append('automation_name', args.automation_name);
    }

    if (args.folder_id) {
      data.append('suite_id', args.folder_id);
    }
    return data;
  }

  private async post(data: FormData): Promise<any> {
    return await getResponse(this.client.api, {
      url: `/import_feature`,
      method: 'POST',
      data,
      headers: data.getHeaders(),
    });
  }

  /** Refuse combinations that cannot work, before anything is read or sent. */
  private validateFlags(args: Arguments): void {
    if (args.sync && !args.folder_id) {
      throw new Error(
        '--sync needs --folder_id: the folder kept in step with these files. Create a folder for them and pass its id.',
      );
    }
    if (args['dry-run'] && !args.sync && !args.write_tags) {
      // Without --sync or --write_tags nothing reads --dry-run, and the
      // upload would be a real import.
      throw new Error(
        '--dry-run needs --sync or --write_tags. Without them the upload is a real import, so it was not sent.',
      );
    }
    if (args.force && !args.sync) {
      throw new Error('--force only applies to --sync.');
    }
    if (args.write_tags && args.sync) {
      throw new Error(
        '--write_tags cannot be combined with --sync. Tag the files once locally, commit them, then sync from CI.',
      );
    }
    if (args.write_tags && isCI()) {
      throw new Error(
        '--write_tags edits your .feature files, so it will not run under CI. Run it locally, review the diff and commit it.',
      );
    }
  }

  private async uploadFeatureFiles(
    args: Arguments,
    matches: string[],
    projectId?: number,
  ): Promise<any> {
    this.validateFlags(args);
    if (matches.length === 0) {
      throw Error('No matching files');
    }
    const batchSize = Number(args.batch_size ?? MAX_FILES_PER_REQUEST);
    if (
      !Number.isInteger(batchSize) ||
      batchSize < 1 ||
      batchSize > MAX_FILES_PER_REQUEST
    ) {
      throw new Error(
        `--batch_size must be an integer between 1 and ${MAX_FILES_PER_REQUEST}, got ${String(args.batch_size)}`,
      );
    }

    // Batch on sizes from stat, so an oversized file is refused before
    // anything is read or sent. Each batch is read once when it is sent: those
    // bytes are uploaded, and their hashes feed the sync digest and the
    // --write_tags check. Only one batch's bytes are in memory at a time.
    const files = listFeatureFiles(
      matches,
      (args.base_dir as string) ?? process.cwd(),
    );
    const batches = batchFeatureFiles(files, batchSize, MAX_BYTES_PER_REQUEST);
    const uploaded: UploadedFile[] = [];
    const dryRun = Boolean(args['dry-run']);
    const syncId = args.sync
      ? crypto.randomBytes(16).toString('hex')
      : undefined;

    if (args.verbose) {
      console.log('Matching files: ', matches);
    }
    if (batches.length > 1) {
      console.log(
        `Uploading ${matches.length} files in ${batches.length} batches of up to ${batchSize} files / ${formatMB(MAX_BYTES_PER_REQUEST)}`,
      );
    }

    const responses: any[] = [];
    for (const [index, batch] of batches.entries()) {
      const label = `Batch ${index + 1}/${batches.length}`;
      const snapshots = readSnapshots(batch, MAX_BYTES_PER_REQUEST);
      uploaded.push(
        ...snapshots.map(({ file, relPath, sha256 }) => ({
          file,
          relPath,
          sha256,
        })),
      );
      const data = this.buildForm(args, projectId);
      if (syncId) {
        this.appendSyncFields(
          data,
          args,
          syncId,
          index,
          batches.length,
          uploaded,
        );
      }
      if (args.write_tags) {
        data.append('write_tags', 'true');
      }
      appendSnapshots(data, snapshots);
      try {
        responses.push(await this.post(data));
      } catch (error) {
        const sentBefore = batches
          .slice(0, index)
          .reduce((sum, b) => sum + b.length, 0);
        const untagged = args.write_tags ? '\nNo file was tagged.' : '';
        if (reportArchiveRefusal(error)) {
          // Only the final batch can be refused. The server rolls it back;
          // earlier batches stay imported unless this is a dry run. A refusal
          // needs --sync, which excludes --write_tags.
          logger.error(
            sentBefore > 0 && !dryRun
              ? `Nothing was archived. The last batch was not imported; the ${sentBefore} files in earlier batches were.`
              : 'Nothing was imported or archived.',
          );
          throw markReported(error);
        }
        if (batches.length > 1) {
          logger.error(
            `${label} failed (${batch.length} files). ` +
              `${sentBefore} of ${matches.length} files were uploaded by earlier batches; ` +
              'this batch and any after it were not. Files in the failed batch:\n' +
              batch.map((f) => `  ${f.file}`).join('\n') +
              untagged,
          );
        } else if (untagged) {
          logger.error(untagged.trim());
        }
        throw error;
      }
      if (batches.length > 1) {
        console.log(`${label} uploaded (${batch.length} files)`);
      }
    }

    // Only after every batch succeeded: a tag is only ever written from a
    // complete, successful import.
    if (args.write_tags) {
      this.writeTagsFrom(responses, uploaded, dryRun);
    }

    if (batches.length === 1) {
      return responses[0];
    }
    console.log(
      `Uploaded ${matches.length} files in ${batches.length} batches`,
    );
    return responses;
  }

  private appendSyncFields(
    data: FormData,
    args: Arguments,
    syncId: string,
    index: number,
    total: number,
    uploaded: UploadedFile[],
  ): void {
    data.append('sync_id', syncId);
    data.append('batch_index', String(index));
    data.append('batch_total', String(total));
    if (index === total - 1) {
      data.append('sync_final', '1');
      // The last batch is sent last, so by now every file has been read.
      data.append('file_count_total', String(uploaded.length));
      data.append('manifest_digest', manifestDigest(uploaded));
    }
    if (args.force) {
      data.append('force', '1');
    }
    if (args['dry-run']) {
      data.append('sync_dry_run', '1');
    }
  }

  private writeTagsFrom(
    responses: any[],
    uploaded: UploadedFile[],
    dryRun: boolean,
  ): void {
    if (responses.some((r) => !Array.isArray(r?.scenarios))) {
      throw new Error(
        'The server did not report where each scenario is, so it predates --write_tags. ' +
          'The files were imported, but no tag was written.',
      );
    }
    const scenarios: ScenarioReport[] = responses.flatMap((r) => r.scenarios);
    const result = writeTags(uploaded, scenarios, dryRun);
    for (const tag of result.tags) {
      console.log(
        `${tag.relPath}:${tag.line} → @TC${tag.key}  ${tag.scenario}`,
      );
    }
    for (const warning of result.warnings) {
      logger.warn(warning);
    }
    if (dryRun) {
      console.log(
        `Dry run: the files were imported into TestQuality (a real import), ` +
          `and ${result.tags.length} tag(s) would be written; no file was changed.`,
      );
    } else {
      console.log(
        `Wrote ${result.tags.length} tag(s) into ${result.files.length} file(s). Review the diff and commit it.`,
      );
    }
  }
}

/**
 * A sync the server refused because it would archive too much: show what it
 * would have archived, so the user can tell a real removal from a bad glob.
 */
function reportArchiveRefusal(error: any): boolean {
  // The SDK turns an error response into an HttpError whose `data` is the
  // body's `data` key; the server sends the list there (and at the top level).
  const status = error?.status ?? error?.response?.status;
  const archive =
    error?.data?.archive ??
    error?.response?.data?.data?.archive ??
    error?.response?.data?.archive;
  if (status !== 409 || !Array.isArray(archive)) {
    return false;
  }
  const message = error?.response?.data?.message ?? error?.message;
  logger.error(
    `${String(message)}\nWould archive:\n` +
      archive
        .map(
          (t: any) =>
            `  TC${String(t.key)}  ${String(t.name)}  (${String(t.folder)})`,
        )
        .join('\n') +
      '\nIf these scenarios really were removed, run again with --force.',
  );
  return true;
}

/** CI is set to something other than an explicit false. */
function isCI(): boolean {
  const value = (process.env.CI ?? '').trim().toLowerCase();
  return value !== '' && value !== 'false' && value !== '0';
}

/** Totals across batches: the server reports each request on its own. */
function printSummary(response: any, args: Arguments): void {
  const responses: any[] = Array.isArray(response) ? response : [response];
  if (!responses.some((r) => r?.counts)) {
    console.log(response);
    return;
  }
  const counts: Record<string, number> = {};
  const warnings: string[] = [];
  const archive: any[] = [];
  const untagged: ScenarioReport[] = [];
  for (const r of responses) {
    for (const [name, value] of Object.entries(r.counts ?? {})) {
      counts[name] = (counts[name] ?? 0) + Number(value);
    }
    warnings.push(...(r.warnings ?? []));
    archive.push(...(r.archive ?? []));
    untagged.push(
      ...(r.scenarios ?? []).filter(
        (s: ScenarioReport) => s.supplied_key === null,
      ),
    );
  }
  console.log(
    Object.entries(counts)
      .map(([name, value]) => `${name}: ${value}`)
      .join(', '),
  );
  if (archive.length > 0) {
    const verb = args['dry-run'] ? 'Would archive' : 'Archived';
    console.log(
      `${verb}:\n` +
        archive
          .map((t) => `  TC${String(t.key)}  ${String(t.name)}`)
          .join('\n'),
    );
  }
  warnings.forEach((w) => {
    logger.warn(w);
  });
  if (untagged.length > 0 && !args.write_tags) {
    console.log(
      `${untagged.length} scenario(s) have no @TC tag, so a rename or move would create a new test. ` +
        'Run upload_feature --write_tags locally once to add them.',
    );
  }
}
