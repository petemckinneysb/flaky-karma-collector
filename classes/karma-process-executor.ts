import * as child from 'child_process';
import { TestRunReport } from './test-run-report';
const submissionsClientRepoDirectory = process.env.QPP_CLIENT_REPO;

export class KarmaProcessExecutor {
    async spawnTestProcess(): Promise<child.ChildProcessWithoutNullStreams> {
        return new Promise<child.ChildProcessWithoutNullStreams>(resolve => {
            const testProcess = child.spawn(`npm run test:headless -- --watch=false`, [], { cwd: submissionsClientRepoDirectory, shell: true });

            testProcess.on('spawn', () => {
                resolve(testProcess);
            });
        });
    }

    async collectTestRunInfo(process: child.ChildProcessWithoutNullStreams): Promise<TestRunReport> {
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

}
