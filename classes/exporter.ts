import { TestRunReport } from "./test-run-report";

export interface Exporter {
    export(results: TestRunReport): void;
}
