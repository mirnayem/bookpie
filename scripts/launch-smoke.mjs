const apiUrl = process.env.API_URL ?? "http://127.0.0.1:4000";
const webUrl = process.env.WEB_URL ?? "http://127.0.0.1:3000";

const checks = [
  `${apiUrl}/health/live`,
  `${apiUrl}/health/ready`,
  `${apiUrl}/openapi.json`,
  `${webUrl}/`,
  `${webUrl}/cart`,
];

const failures = [];

for (const url of checks) {
  const response = await fetch(url).catch((error) => ({ ok: false, status: error.message }));
  if (!response.ok) {
    failures.push({ url, status: response.status });
  }
}

if (failures.length) {
  console.error(JSON.stringify({ success: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ success: true, checked: checks.length }, null, 2));
