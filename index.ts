import { KarmaProcessExecutor } from './classes/karma-process-executor';
import { TextFileExporter } from './classes/text-file-exporter';

const numberOfRuns: number = process.env.QPP_FLAKY_RUNS ? +process.env.QPP_FLAKY_RUNS : 2;
const MAX_RUNS: number = 10;

async function main() {
    if (numberOfRuns > MAX_RUNS) {
        console.error(`Number of runs exceeds ${MAX_RUNS} threshold!`);
        return;
    }

    console.log(`Running Tests [${numberOfRuns}] times at ~2 minutes for each run.`);
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
    }
}

main();
