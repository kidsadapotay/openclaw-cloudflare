# Kiến trúc OpenClaw

## Tổng quan

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
           │ Diff từ      │     │ Validate     │     │ DeepSeek     │
           │ GitHub API   │     │ Files        │     │ Review       │
           └──────────────┘     └──────────────┘     └──────────────┘
                                                              │
                                                              ▼
                                                    ┌──────────────┐
                                                    │ Post Comment │
                                                    │ lên GitHub   │
                                                    └──────────────┘
```

## Flow chi tiết

### 1. Nhận Webhook

```typescript
// src/index.ts
POST /webhook
├── Verify signature (HMAC-SHA256)
├── Parse event type
├── Chỉ xử lý: pull_request (opened, synchronize, reopened)
└── Return 202 Accepted (async processing)
```

### 2. Fetch Data

```typescript
// src/github/api.ts
├── Fetch .openclaw.yml config (nếu có)
├── Fetch PR files với patch/diff
└── Detect language cho mỗi file
```

### 3. Filter Files

```typescript
// src/filters/
├── Loại bỏ deleted files
├── Match ignore patterns (glob)
├── Filter theo language (nếu config)
├── Check size limits
│   ├── max_files
│   ├── max_lines_per_file
│   └── max_total_lines
└── Skip PR nếu vượt limits
```

### 4. AI Review

```typescript
// src/review/
├── Security Review (DeepSeek-R1 32B)
│   └── SQL injection, XSS, secrets, OWASP
├── Quality Review (DeepSeek-Coder 6.7B)
│   └── Code style, bugs, best practices
├── Refactor Review (DeepSeek-R1 32B)
│   └── Extract method, reduce complexity
└── Tests Review (DeepSeek-Coder 6.7B)
    └── Missing tests, coverage gaps
```

### 5. Format & Post

```typescript
// src/utils/formatter.ts
├── Group issues by severity
├── Format markdown table
├── Collapse low-priority items
└── Post/Update comment on PR
```

## AI Models

| Model | Dùng cho | Lý do |
|-------|----------|-------|
| `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` | Security, Refactor | Cần reasoning sâu |
| `@cf/deepseek-ai/deepseek-coder-6.7b-instruct` | Quality, Tests | Nhanh, chuyên code |

## Security

- **Webhook Signature:** HMAC-SHA256 verify mọi request
- **Secrets:** Stored in Cloudflare encrypted
- **Token Scope:** Chỉ cần `repo` scope
- **No Storage:** Không lưu code hay secrets

## Limits mặc định

```yaml
limits:
  max_files: 15
  max_lines_per_file: 300
  max_total_lines: 1500
```

Có thể override qua `.openclaw.yml`.

## Error Handling

```
PR Event
    │
    ├── Signature invalid → 401 Unauthorized
    ├── Not PR event → 200 Ignored
    ├── Not opened/sync/reopen → 200 Ignored
    ├── Size limit exceeded → Comment "Review skipped"
    ├── No reviewable files → Comment "No files to review"
    ├── AI error → Comment "Review failed"
    └── Success → Comment with review results
```

## Performance

- **Cold start:** ~50ms (Worker)
- **Warm request:** ~10ms (Worker)
- **AI inference:** 2-10s (tùy model và input size)
- **Total time:** Thường 5-15s cho PR nhỏ

## Scaling

- **Global edge:** 300+ Cloudflare locations
- **Auto-scale:** Không cần config
- **Rate limit:** 100K requests/day (free)
- **AI limit:** 10K neurons/day (free)
