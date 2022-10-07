export class TestRunReport {
    seed: number;
    testFailures: string[];

    constructor(seed: number, testFailures: string[]) {
        this.seed = seed;
        this.testFailures = [...testFailures];
    }

    get isFailureResult(): boolean {
        return this.testFailures.length > 0;
    }

    get toFormattedString() {
        let formattedString: string = '';

        formattedString = `Test Seed: ${this.seed}\n`;

        for (let failure of this.testFailures) {
            formattedString += `${failure}\n`;
        }

        return formattedString;
    }
}
