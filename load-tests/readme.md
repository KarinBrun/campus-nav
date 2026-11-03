# Campus Nav Load Testing

This directory contains load-testing scripts used to evaluate the Campus Nav backend under concurrent user activity.

Testing was performed using [k6](https://grafana.com/docs/k6/latest/) against a locally running backend connected to an isolated MongoDB database (`campusNavTest`).

## Test Scripts

| File | Purpose |
|---|---|
| `registration.js` | Simulates 50 concurrent user registrations |
| `activity.js` | Simulates 100 authenticated users accessing application endpoints |
| `generate-schedules.js` | Generates realistic class schedules for test accounts |

## Test Setup

The tests require:

- k6 installed
- Node.js and backend dependencies installed
- A locally running Campus Nav backend
- An isolated MongoDB test database named `campusNavTest`
- Test data containing 413 classes for schedule generation

The backend must be configured to use `campusNavTest`, not the production database.

## Running the Tests

### Registration

Create 50 test accounts:

```powershell
k6 run -e RUN_ID=activity50 load-tests/registration.js
```

Create another 50 accounts:

```powershell
k6 run -e RUN_ID=activity100 load-tests/registration.js
```

### Generate Schedules

After registering the accounts, generate their schedules:

```powershell
$env:RUN_ID="activity50"
node load-tests/generate-schedules.js

$env:RUN_ID="activity100"
node load-tests/generate-schedules.js
```

The schedule-generation script requires exactly 50 matching test users and 413 class records. Existing populated schedules are preserved.

### Activity Testing

Run the 100-user activity test:

```powershell
k6 run -e BASE_URL=http://localhost:5000 load-tests/activity.js
```

Each simulated user logs in and accesses the account, schedule, events, classes, and rooms endpoints.

## Test Results

| Test | Result |
|---|---|
| 50 concurrent registrations | 100% successful |
| 50-user activity tests | 0 HTTP failures |
| 100-user activity test | 600/600 checks passed |
| 100-user average HTTP response time | 2.05 seconds |
| 100-user 95th-percentile response time | 3.47 seconds |

These results represent local API testing, not full browser simulations or sustained production traffic. Response times increased as concurrency increased, but all requests succeeded during the 100-user test.

## Safety

- Registration and activity scripts default to localhost and block remote targets unless explicitly authorized.
- The schedule-generation script verifies that the database is `campusNavTest` before modifying data.
- Test accounts use identifiable email addresses ending in `@example.com`.
- Database credentials and environment files are not included in the repository.

**Do not run these scripts against the production Campus Nav database.**