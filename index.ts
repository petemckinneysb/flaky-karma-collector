import { KarmaProcessExecutor } from './classes/karma-process-executor';
import { TextFileExporter } from './classes/text-file-exporter';
import * as fs from 'fs';
import * as child from 'child_process';

const numberOfRuns: number = process.env.QPP_FLAKY_RUNS ? +process.env.QPP_FLAKY_RUNS : 2;
const MAX_RUNS: number = 50;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

(async () => {
    if (!isEnvironmentValid()) {
        console.error('Environment variables invalid, there should be messages above this indicating the issues');
        return;
    }

    if(!(await isSubmissionClientRepo())) {
        console.error('QPP_CLIENT_REPO does not point to a valid client git repository.');
        return;
    }

    console.log(`Running Tests [${numberOfRuns}] times at ~1 minutes for each run.`);
    const overallStartTime = new Date().getTime();
    for (let i = 0; i < numberOfRuns; i++) {
        console.log(`[${i + 1}] Starting Test Run...`);

        const executor = new KarmaProcessExecutor();

        const startTime = new Date().getTime();
        const testProcess = await executor.spawnTestProcess();

        let result = await executor.collectTestRunInfo(testProcess);
        const elapsedTime = new Date().getTime() - startTime;

        if (result.isFailureResult) {
            let exporter = new TextFileExporter();
            exporter.export(result);
        }

        console.log(`[${i + 1}] Completed Run for seed: ${result.seed}. Failures Detected: ${result.isFailureResult}. Test Run Time: ${elapsedTime / 1000}s`);
        console.log(`Suspending for 1 minute.`);
        //await sleep(60000);
    }

    const overallElapsedTime = new Date().getTime() - overallStartTime;
    console.log(`Total run time: ${overallElapsedTime}`);
})();

function isEnvironmentValid(): boolean {
    if (numberOfRuns > MAX_RUNS) {
        console.error(`Number of runs exceeds ${MAX_RUNS} threshold!`);
        return false;
    }

    if (!process.env.QPP_CLIENT_REPO || !fs.existsSync(process.env.QPP_CLIENT_REPO)) {
        console.error(`QPP_CLIENT_REPO undefined or directory does not exist.`);
        return false;
    }

    if(!isSubmissionClientRepo()) {
      console.error(`QPP_CLIENT_REPO does not point to a valid QPP CLIENT GIT REPOSITORY`);
      return false;
    }

    return true;
}

function isSubmissionClientRepo(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    child.exec(
      "git remote get-url origin",
      { cwd: process.env.QPP_CLIENT_REPO },
      (error, stdout: string) => {
        if (error) {
          reject();
          return;
        }

        const remoteUrl = stdout.trim();
        const urlParts = remoteUrl.split("/");
        const repoName = urlParts[urlParts.length - 1]?.replace(/\.git$/, "");

        resolve(repoName === "qpp-submission-client");
      },
    );
  });
}
