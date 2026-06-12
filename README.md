# LLM Gateway Benchmark

Benchmark OpenAI-compatible gateways before you trust them in production.

LLM Gateway Benchmark is a small CLI for testing latency, reliability, and estimated cost across any OpenAI-compatible endpoint. It is designed for AI API gateways, local model servers, internal routing layers, and provider comparison workflows.

## Why this exists

Many endpoints claim to be OpenAI-compatible. Compatibility is not just whether one curl request works. You also care about:

- p50 and p95 latency
- success rate
- response shape
- model routing behavior
- error rate
- estimated token cost
- repeatability across scenarios

This repo gives developers a neutral benchmark harness they can fork, extend, and run against their own stack.

## Quickstart

```bash
npx llm-gateway-benchmark run --config examples/config.example.json
```

Or clone locally:

```bash
git clone https://github.com/quotacheap/llm-gateway-benchmark.git
cd llm-gateway-benchmark
npm install
npm test
node bin/llm-gateway-benchmark.mjs run --config examples/config.example.json --dry-run
```

## Config

```json
{
  "runs": 3,
  "timeoutMs": 30000,
  "gateways": [
    {
      "name": "quotacheap",
      "baseUrl": "https://api.quota.cheap/v1",
      "apiKeyEnv": "QUOTACHEAP_API_KEY",
      "model": "gpt-5.4-mini"
    }
  ],
  "scenarios": [
    {
      "name": "short-answer",
      "messages": [
        { "role": "user", "content": "Explain API gateway observability in one sentence." }
      ]
    }
  ]
}
```

## Commands

### `run`

Run benchmark scenarios.

```bash
llm-gateway-benchmark run --config examples/config.example.json
```

Options:

- `--config <path>` - benchmark config JSON
- `--dry-run` - validate and print planned runs without calling gateways
- `--format json|markdown` - output format

### `validate`

Validate config only.

```bash
llm-gateway-benchmark validate --config examples/config.example.json
```

## Output

Markdown output is designed to paste into GitHub issues, PRs, or release notes.

```md
| Gateway | Scenario | Runs | Success | p50 ms | p95 ms | Est. cost |
|---|---:|---:|---:|---:|---:|---:|
| quotacheap | short-answer | 3 | 100% | 820 | 1040 | $0.000014 |
```

## Fair benchmarking rules

- Do not compare endpoints using different prompts unless that is the test.
- Do not publish provider rankings from tiny samples.
- Separate cold-start tests from warmed tests.
- Report failures, timeouts, and retries clearly.
- Keep private API keys and payloads out of public reports.

## Production note

Benchmarks tell you how a gateway behaves during a test. In production, you still need request logs, quotas, usage tracking, balances, latency history, and billing visibility.

QuotaCheap provides an [OpenAI-compatible API gateway](https://www.quota.cheap?utm_source=github&utm_medium=readme&utm_campaign=llm-gateway-benchmark) with those controls.

## License

MIT
