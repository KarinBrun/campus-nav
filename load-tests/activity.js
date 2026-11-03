
import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

const target = new URL(BASE_URL);

const isLocal = ["localhost", "127.0.0.1", "::1"].includes(
  target.hostname
);

if (!isLocal && __ENV.ALLOW_REMOTE_TEST !== "true") {
  throw new Error(
    "Load testing a remote backend is disabled. " +
    "Set ALLOW_REMOTE_TEST=true only for an approved test environment."
  );
}
const PASSWORD = "TestPassword123!";

// Track response times separately for each endpoint
const loginDuration = new Trend("login_duration", true);
const accountDuration = new Trend("account_duration", true);
const scheduleDuration = new Trend("schedule_duration", true);
const eventsDuration = new Trend("events_duration", true);
const classesDuration = new Trend("classes_duration", true);
const roomsDuration = new Trend("rooms_duration", true);

export const options = {
  scenarios: {
    activity: {
      executor: "per-vu-iterations",
      vus: 100,
      iterations: 1,
      maxDuration: "2m",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
  },
};

export default function () {
  const email =
    __VU <= 50
        ? `loadtest-activity50-${__VU}@example.com`
        : `loadtest-activity100-${__VU - 50}@example.com`;

  // Step 1: Log in
  const login = http.post(
    `${BASE_URL}/api/users/login`,
    JSON.stringify({
      email,
      password: PASSWORD,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: "30s",
    }
  );

  loginDuration.add(login.timings.duration);

  const loginSuccessful = check(login, {
    "login successful": (r) => r.status === 200,
  });

  if (!loginSuccessful) {
    console.error(`Login failed for VU ${__VU}: ${login.status}`);
    return;
  }

  const token = login.json("token");

  if (!token) {
    console.error(`No JWT received for VU ${__VU}`);
    return;
  }

  const params = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: "30s",
  };

  // Step 2: Load account information
  const account = http.get(`${BASE_URL}/api/users/me`, params);
  accountDuration.add(account.timings.duration);

  check(account, {
    "account loaded": (r) => r.status === 200,
  });

  sleep(1);

  // Step 3: Load schedule
  const schedule = http.get(`${BASE_URL}/api/schedules`, params);
  scheduleDuration.add(schedule.timings.duration);

  check(schedule, {
    "schedule loaded": (r) => r.status === 200,
  });

  sleep(1);

  // Step 4: Browse events
  const events = http.get(`${BASE_URL}/api/pins`, params);
  eventsDuration.add(events.timings.duration);

  check(events, {
    "events loaded": (r) => r.status === 200,
  });

  sleep(1);

  // Step 5: Browse classes
  const classes = http.get(`${BASE_URL}/api/classes`, params);
  classesDuration.add(classes.timings.duration);

  check(classes, {
    "classes loaded": (r) => r.status === 200,
  });

  sleep(1);

  // Step 6: Browse rooms
  const rooms = http.get(`${BASE_URL}/api/rooms`, params);
  roomsDuration.add(rooms.timings.duration);

  check(rooms, {
    "rooms loaded": (r) => r.status === 200,
  });
}
