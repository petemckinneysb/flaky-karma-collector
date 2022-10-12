export class Logger {
    static log(text: string) {
        if (Boolean(process.env.QPP_FLAKY_LOG_ENABLED)) {
            console.log(text);
        }
    }
}
