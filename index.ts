import * as child from 'child_process';
import { TestRunReport } from './classes/test-run-report';
import * as fs from 'fs';

const submissionsClientRepoDirectory = process.env.QPP_CLIENT_REPO;
const numberOfRuns: number = process.env.QPP_FLAKY_RUNS ? +process.env.QPP_FLAKY_RUNS : 2;

async function spawnTestProcess(): Promise<child.ChildProcessWithoutNullStreams> {
    return new Promise<child.ChildProcessWithoutNullStreams>(resolve => {
        const testProcess = child.spawn(`npm run test:headless -- --watch=false`, [], { cwd: submissionsClientRepoDirectory, shell: true });

        testProcess.on('spawn', () => {
            resolve(testProcess);
        });
    });
}

async function collectTestRunInfo(process: child.ChildProcessWithoutNullStreams): Promise<TestRunReport> {
    return new Promise<TestRunReport>(resolve => {
        var failedInfo: string[] = [];
        var seedInfo: string = '';

        process.stdout.setEncoding('utf8');
        process.stdout.on('data', (data) => {
            if ((data.includes(' FAILED\n'))) {
                failedInfo.push(data);
            }

            if (data.includes('Randomized with seed')) {
                seedInfo = data.split(' ').pop();
            }
        });

        process.on('close', (code) => {
            const testRunReport = new TestRunReport(+seedInfo, failedInfo);
            resolve(testRunReport);
        });
    });
}

function dumpResultsToFile(results: TestRunReport[]) {
    const outputDir = './output';
    const outputFile = `${outputDir}/${(new Date).toISOString()}-flaky-report.txt`;

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const aggregatedResults = results.map(result => result.toFormattedString).join('\n\n');
    fs.writeFileSync(outputFile, aggregatedResults);
}

async function main() {
    if (numberOfRuns > 30) {
        console.error("Number of runs exceeds 30 threshold!");
        return;
    }

    var failureResults: TestRunReport[] = [];

    for (let i = 0; i < numberOfRuns; i++) {
        console.log(`[${i + 1}] Starting Test Run...`);

        const testProcess: child.ChildProcessWithoutNullStreams = await spawnTestProcess();
        let result = await collectTestRunInfo(testProcess);
        failureResults.push(result);

        console.log(`[${i + 1}] Completed Run for seed: ${result.seed}. Failures Detected: ${result.isFailureResult}`);
    }

    dumpResultsToFile(failureResults);
}

main();
