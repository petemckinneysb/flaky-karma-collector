export class Logger {
    static log(text: string) {
        if (process.env.QPP_FLAKY_LOG_ENABLED === 'true') {
            console.log(text);
        }
    }
}
