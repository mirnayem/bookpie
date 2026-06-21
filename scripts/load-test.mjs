const baseUrl = process.env.LOAD_TEST_BASE_URL ?? "http://127.0.0.1:4000";
const concurrency = Number(process.env.LOAD_TEST_CONCURRENCY ?? 10);
const requests = Number(process.env.LOAD_TEST_REQUESTS ?? 100);
const paths = ["/health", "/api/v1/books?limit=12", "/api/v1/categories"];

async function hit(path) {
  const started = performance.now();
  const response = await fetch(`${baseUrl}${path}`);
  return {
    ok: response.ok,
    status: response.status,
    ms: performance.now() - started,
  };
}

async function worker(results) {
  while (results.length < requests) {
    const index = results.length;
    results.push(await hit(paths[index % paths.length]));
  }
}

const results = [];
await Promise.all(Array.from({ length: concurrency }, () => worker(results)));

const sorted = results.map((result) => result.ms).sort((a, b) => a - b);
const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
const failures = results.filter((result) => !result.ok).length;

console.log(JSON.stringify({
  baseUrl,
  requests: results.length,
  concurrency,
  failures,
  p95Ms: Math.round(p95),
  maxMs: Math.round(sorted.at(-1) ?? 0),
}, null, 2));
