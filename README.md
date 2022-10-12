## flaky-karma-collector 


### Setup

```bash
npm ci
export QPP_CLIENT_REPO="path/to/client/repository"
export QPP_FLAKY_RUNS="number of desired full test runs" (defaults to 2 if not provided)
export QPP_FLAKY_LOG_ENABLED=true (this will print stdout and stderr from the karma test run to the current console)

npm run start

```


### Output 
Test Runs are currently output to a text file stored in ./output. The seed value is stored as well as all
test failures reported.

### Latest Flaky Tests Identified: 
https://gist.github.com/petemckinneysb/daa3e6477e2648d275ecc8b94e527c8b
