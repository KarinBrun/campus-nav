
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

const target = new URL(BASE_URL);

const isLocal =
  ["localhost", "127.0.0.1", "::1"].includes(target.hostname);

if (!isLocal && __ENV.ALLOW_REMOTE_TEST !== "true") {
  throw new Error(
    "Load testing a remote backend is disabled. " +
    "Set ALLOW_REMOTE_TEST=true only for an approved test environment."
  );
}

// Unique run identifier to avoid duplicate emails on repeat tests.
const RUN_ID = __ENV.RUN_ID || "test";

export const options = {
  scenarios: {
    registration: {
      executor: "per-vu-iterations",
      vus: 50,
      iterations: 1,
      maxDuration: "1m",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const email = `loadtest-${RUN_ID}-${__VU}@example.com`;

  const payload = JSON.stringify({
    firstName: "Load",
    lastName: "Test",
    email,
    password: "TestPassword123!",
    website: "",
  });

  const response = http.post(
    `${BASE_URL}/api/users/register`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: "30s",
    }
  );

  check(response, {
    "registration successful": (r) => r.status === 201,
  });

  if (response.status !== 201) {
    console.error(
      `Registration failed: ${response.status} ${response.body}`
    );
  }

  sleep(1);
}
