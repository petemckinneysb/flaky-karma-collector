import { Exporter } from "./exporter";
import * as fs from 'fs';
import { TestRunReport } from "./test-run-report";

const outputDir = './output';
const outputFile = `${outputDir}/${(new Date).toISOString()}-flaky-report.txt`;

export class TextFileExporter implements Exporter {
    export(results: TestRunReport): void {
        this.createFileIfNotExists(outputDir);
        this.appendResultsToFile(results);
    }

    private createFileIfNotExists(directory: string) {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }
    }

    appendResultsToFile(results: TestRunReport): void {
        this.createFileIfNotExists(outputDir);

        let stream = fs.createWriteStream(outputFile, { flags: 'a' });

        stream.write(results.toFormattedString);
        stream.end();
    }
}
