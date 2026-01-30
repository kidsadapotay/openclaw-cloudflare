# OpenClaw - AI Code Review System on Cloudflare

**Date:** 2026-01-30
**Status:** Draft
**Author:** AI-assisted design

---

## Overview

OpenClaw is a fully cloud-based AI code review system running on Cloudflare Workers. It automatically reviews Pull Requests on GitHub and posts comprehensive feedback as PR comments.

## Architecture

```
┌─────────────┐     Webhook      ┌──────────────────┐
│   GitHub    │ ───────────────► │  Cloudflare      │
│   PR Event  │                  │  Worker          │
└─────────────┘                  └────────┬─────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
           ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
           │ Fetch PR     │     │ Filter &     │     │ Workers AI   │
           │ Diff from    │     │ Validate     │     │ Code Review  │
           │ GitHub API   │     │ Files        │     │ Analysis     │
           └──────────────┘     └──────────────┘     └──────────────┘
                                                              │
                                                              ▼
                                                    ┌──────────────┐
                                                    │ Post Comment │
                                                    │ to GitHub PR │
                                                    └──────────────┘
```

### Flow

1. GitHub sends webhook when PR opened/synchronize
2. Worker verifies webhook signature, fetches full diff from GitHub API
3. Filters files based on `.openclaw.yml` + size limits
4. Calls Cloudflare Workers AI (DeepSeek) to analyze code
5. Formats results and posts comment to PR

## Technical Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Platform | Cloudflare Workers | Serverless, global edge, free tier |
| Trigger | GitHub Webhook | Native integration, real-time |
| AI Model | DeepSeek (Workers AI) | Free, strong code understanding |
| Storage | Stateless | Simplicity, no persistence needed |
| Config | `.openclaw.yml` | Per-repo customization |

## AI Model Strategy

### Default Configuration (DeepSeek)

```typescript
const MODELS = {
  security: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',  // Deep reasoning
  quality: '@cf/deepseek-ai/deepseek-coder-6.7b-instruct',   // Fast, code-focused
  refactor: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',  // Deep reasoning
  tests: '@cf/deepseek-ai/deepseek-coder-6.7b-instruct'      // Fast, code-focused
};
```

- **DeepSeek-R1 (32B)**: For security and refactor (requires deep reasoning)
- **DeepSeek-Coder (6.7B)**: For quality and tests (fast, code-specialized)

### Alternative Models

| Model | ID | Size | Best For |
|-------|-----|------|----------|
| **DeepSeek-R1** | `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` | 32B | Security, Refactor |
| **DeepSeek-Coder** | `@cf/deepseek-ai/deepseek-coder-6.7b-instruct` | 6.7B | Quality, Tests |
| **Qwen 2.5 Coder** | `@cf/qwen/qwen2.5-coder-32b-instruct` | 32B | All (Vietnamese support) |
| **Llama 3.1 70B** | `@cf/meta/llama-3.1-70b-instruct` | 70B | General purpose |
| **Llama 3.1 8B** | `@cf/meta/llama-3.1-8b-instruct` | 8B | Fast, balanced |
| **Llama 3.2 3B** | `@cf/meta/llama-3.2-3b-instruct` | 3B | Ultra-fast, budget |
| **Mistral 7B** | `@cf/mistral/mistral-7b-instruct-v0.2` | 7B | General purpose |

### Recommended Configurations

**High Quality (Slow):**
```typescript
const MODELS = {
  security: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
  quality: '@cf/qwen/qwen2.5-coder-32b-instruct',
  refactor: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
  tests: '@cf/qwen/qwen2.5-coder-32b-instruct',
};
```

**Fast & Cheap:**
```typescript
const MODELS = {
  security: '@cf/meta/llama-3.1-8b-instruct',
  quality: '@cf/deepseek-ai/deepseek-coder-6.7b-instruct',
  refactor: '@cf/meta/llama-3.1-8b-instruct',
  tests: '@cf/deepseek-ai/deepseek-coder-6.7b-instruct',
};
```

**Ultra Budget:**
```typescript
const MODELS = {
  security: '@cf/meta/llama-3.2-3b-instruct',
  quality: '@cf/meta/llama-3.2-3b-instruct',
  refactor: '@cf/meta/llama-3.2-3b-instruct',
  tests: '@cf/meta/llama-3.2-3b-instruct',
};
```

### Using External APIs (Claude/GPT)

For highest quality, use Cloudflare AI Gateway to proxy to Claude or GPT:

```typescript
// Via AI Gateway
const response = await fetch(
  `https://gateway.ai.cloudflare.com/v1/${ACCOUNT_ID}/${GATEWAY_ID}/anthropic/v1/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.ANTHROPIC_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  }
);
```

See [docs/AI_MODELS.md](../AI_MODELS.md) for detailed model comparison and configuration guide.

## Configuration File

```yaml
# .openclaw.yml
version: 1

# Review aspects (all enabled by default)
review:
  security: true        # SQL injection, XSS, secrets, OWASP
  quality: true         # Code style, best practices, bugs
  refactor: true        # Improvement suggestions
  tests: true           # Test coverage suggestions

# Files/patterns to ignore
ignore:
  - "*.lock"
  - "*.min.js"
  - "dist/**"
  - "node_modules/**"
  - "**/*.generated.*"
  - "package-lock.json"
  - "yarn.lock"

# Size limits to avoid timeout
limits:
  max_files: 20
  max_lines_per_file: 500
  max_total_lines: 2000

# Languages to review (auto-detect if not set)
languages:
  - javascript
  - typescript
  - python

# Review verbosity
verbosity: normal  # minimal | normal | detailed
```

### Default Config

When no `.openclaw.yml` exists:
- All review aspects enabled
- Common ignore patterns (lock files, node_modules, dist)
- Limits: 15 files, 300 lines/file, 1500 total lines

## Project Structure

```
openclaw/
├── src/
│   ├── index.ts              # Entry point, webhook handler
│   ├── github/
│   │   ├── webhook.ts        # Verify signature, parse events
│   │   ├── api.ts            # Fetch PR diff, post comments
│   │   └── types.ts          # GitHub API types
│   ├── review/
│   │   ├── analyzer.ts       # Orchestrate review process
│   │   ├── security.ts       # Security-focused prompts
│   │   ├── quality.ts        # Quality-focused prompts
│   │   ├── refactor.ts       # Refactoring suggestions
│   │   └── tests.ts          # Test coverage prompts
│   ├── filters/
│   │   ├── files.ts          # Filter by extension, patterns
│   │   └── size.ts           # Size limit checks
│   ├── config/
│   │   ├── parser.ts         # Parse .openclaw.yml
│   │   └── defaults.ts       # Default configuration
│   └── utils/
│       ├── diff-parser.ts    # Parse unified diff format
│       └── formatter.ts      # Format AI response → markdown
├── wrangler.toml             # Cloudflare Worker config
├── package.json
└── tsconfig.json
```

## Webhook Handler

```typescript
// src/index.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 1. Only accept POST from GitHub
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // 2. Verify GitHub webhook signature
    const signature = request.headers.get('x-hub-signature-256');
    const body = await request.text();

    if (!verifySignature(body, signature, env.GITHUB_WEBHOOK_SECRET)) {
      return new Response('Invalid signature', { status: 401 });
    }

    // 3. Parse event, only handle PR opened/synchronize
    const event = request.headers.get('x-github-event');
    const payload = JSON.parse(body);

    if (event !== 'pull_request') {
      return new Response('Ignored event', { status: 200 });
    }

    if (!['opened', 'synchronize'].includes(payload.action)) {
      return new Response('Ignored action', { status: 200 });
    }

    // 4. Process review (non-blocking with waitUntil)
    const ctx = { waitUntil: (p: Promise<any>) => p };
    ctx.waitUntil(processReview(payload, env));

    // 5. Return immediately to avoid GitHub timeout
    return new Response('Review started', { status: 202 });
  }
};
```

## Review Process

```typescript
// src/review/analyzer.ts
async function processReview(payload: PRPayload, env: Env) {
  const { pull_request: pr, repository: repo } = payload;

  // 1. Fetch .openclaw.yml config from repo (if exists)
  const config = await fetchConfig(repo, pr.head.ref, env.GITHUB_TOKEN);

  // 2. Fetch PR diff
  const diff = await fetchPRDiff(repo.full_name, pr.number, env.GITHUB_TOKEN);

  // 3. Parse and filter files
  const files = parseDiff(diff);
  const filtered = filterFiles(files, config);

  // 4. Check size limits
  const sizeCheck = checkSizeLimits(filtered, config.limits);
  if (!sizeCheck.ok) {
    await postComment(repo, pr.number, formatSkipMessage(sizeCheck), env);
    return;
  }

  // 5. Call Workers AI for each enabled aspect
  const reviews = await Promise.all([
    config.review.security && reviewSecurity(filtered, env.AI),
    config.review.quality && reviewQuality(filtered, env.AI),
    config.review.refactor && reviewRefactor(filtered, env.AI),
    config.review.tests && reviewTests(filtered, env.AI),
  ].filter(Boolean));

  // 6. Merge results and post comment
  const comment = formatReviewComment(reviews, config.verbosity);
  await postComment(repo, pr.number, comment, env.GITHUB_TOKEN);
}
```

## GitHub Comment Format

```markdown
## 🔍 OpenClaw Code Review

**PR:** #123 | **Files reviewed:** 8/12 | **Model:** DeepSeek-R1

---

### 🔒 Security
| Severity | File | Line | Issue |
|----------|------|------|-------|
| 🔴 HIGH | `src/api/auth.ts` | 45 | Potential SQL injection |
| 🟡 MEDIUM | `src/utils/crypto.ts` | 23 | Deprecated hash algorithm |

---

### ✨ Code Quality
- **`src/handlers/user.ts:67`** - Extract duplicate validation logic
- **`src/models/order.ts:112`** - Magic number should be constant

---

### ♻️ Refactoring Suggestions
- `src/services/payment.ts` - Function too long, consider splitting

---

### 🧪 Test Coverage
- Missing test for error case in `src/api/auth.ts:handleLogin()`

---

<details>
<summary>📋 Review Config</summary>

security: ✓ | quality: ✓ | refactor: ✓ | tests: ✓
files_skipped: 4 (matched ignore patterns)
</details>

> ⚡ Powered by OpenClaw on Cloudflare Workers
```

## Deployment

### wrangler.toml

```toml
name = "openclaw"
main = "src/index.ts"
compatibility_date = "2024-12-01"

[ai]
binding = "AI"
```

### Setup Commands

```bash
# 1. Clone & install
git clone https://github.com/you/openclaw
cd openclaw
npm install

# 2. Set secrets
wrangler secret put GITHUB_TOKEN
wrangler secret put GITHUB_WEBHOOK_SECRET

# 3. Deploy
wrangler deploy
```

### GitHub Webhook Setup

1. Repository Settings → Webhooks → Add webhook
2. Payload URL: `https://openclaw.<subdomain>.workers.dev`
3. Content type: `application/json`
4. Secret: (same as GITHUB_WEBHOOK_SECRET)
5. Events: Select "Pull requests"

## Cost Estimate

| Resource | Free Tier | After Free Tier |
|----------|-----------|-----------------|
| Workers requests | 100K/day | $0.50/1M |
| Workers AI (neurons) | 10K/day | ~$0.011/1K |

**Estimated usage:** ~50 PRs/day stays within free tier.

## Future Enhancements

- [ ] Support GitLab webhooks
- [ ] Add dashboard with R2 + D1 for history/analytics
- [ ] Inline PR comments (per-line instead of single comment)
- [ ] Support custom AI prompts in config
- [ ] Rate limiting and queue management for large orgs

---

## Implementation Checklist

- [ ] Initialize project with wrangler
- [ ] Implement webhook handler with signature verification
- [ ] Implement GitHub API client (fetch diff, post comment)
- [ ] Implement config parser for .openclaw.yml
- [ ] Implement file filters (patterns, size limits)
- [ ] Implement diff parser
- [ ] Create AI prompts for each review aspect
- [ ] Implement review orchestrator
- [ ] Implement comment formatter
- [ ] Write tests
- [ ] Deploy and test with real PR
