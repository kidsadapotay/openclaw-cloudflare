# OpenClaw - AI Code Review on Cloudflare Workers

Hệ thống tự động review code bằng AI khi có Pull Request trên GitHub. Chạy hoàn toàn trên Cloudflare Workers (miễn phí).

## Tính năng

- **Tự động review** khi có PR mới hoặc push thêm commits
- **4 khía cạnh review:** Security, Code Quality, Refactoring, Test Coverage
- **AI Model:** DeepSeek, Llama, Qwen, Mistral (miễn phí qua Cloudflare Workers AI)
- **Hỗ trợ Claude/GPT** qua AI Gateway (tùy chọn)
- **Cấu hình linh hoạt** qua file `.openclaw.yml`
- **Stateless:** Không cần database, không lưu trữ dữ liệu

## Tài liệu

| Document | Mô tả |
|----------|-------|
| [docs/QUICK_START.md](docs/QUICK_START.md) | Hướng dẫn nhanh 5 phút |
| [docs/AI_MODELS.md](docs/AI_MODELS.md) | So sánh và chọn AI model |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Kiến trúc hệ thống |
| [docs/FAQ.md](docs/FAQ.md) | Câu hỏi thường gặp |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Hướng dẫn đóng góp |
| [CHANGELOG.md](CHANGELOG.md) | Lịch sử phiên bản |

## Yêu cầu

- [Node.js](https://nodejs.org/) v18+
- [Tài khoản Cloudflare](https://dash.cloudflare.com/sign-up) (miễn phí)
- [Tài khoản GitHub](https://github.com/) với repo cần review

---

## Hướng dẫn cài đặt

### Bước 1: Clone project

```bash
git clone https://github.com/your-username/openclaw.git
cd openclaw
npm install
```

### Bước 2: Đăng nhập Cloudflare

```bash
npx wrangler login
```

Lệnh này sẽ mở trình duyệt để bạn đăng nhập vào Cloudflare.

### Bước 3: Deploy Worker

```bash
npx wrangler deploy
```

Sau khi deploy thành công, bạn sẽ nhận được URL như:
```
https://openclaw.your-subdomain.workers.dev
```

**Lưu lại URL này!**

### Bước 4: Tạo GitHub Personal Access Token

1. Vào https://github.com/settings/tokens/new
2. Đặt tên: `OpenClaw Bot`
3. Chọn Expiration: `No expiration` (hoặc thời gian bạn muốn)
4. Chọn scope: **repo** (Full control of private repositories)
5. Click **Generate token**
6. **Copy token** (chỉ hiển thị 1 lần!)

### Bước 5: Tạo Webhook Secret

Tạo một chuỗi ngẫu nhiên để bảo mật webhook. Ví dụ:
```bash
# Linux/Mac
openssl rand -hex 32

# Hoặc dùng bất kỳ chuỗi nào bạn muốn
# Ví dụ: my-super-secret-key-12345
```

**Lưu lại secret này!**

### Bước 6: Set Secrets cho Worker

```bash
# Set GitHub Token
npx wrangler secret put GITHUB_TOKEN
# Paste token từ Bước 4 khi được hỏi

# Set Webhook Secret
npx wrangler secret put GITHUB_WEBHOOK_SECRET
# Paste secret từ Bước 5 khi được hỏi
```

> **Lưu ý:** Khi paste, ký tự sẽ không hiển thị trên màn hình. Đó là bình thường.

### Bước 7: Cấu hình GitHub Webhook

1. Vào repo GitHub bạn muốn review
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Điền thông tin:

| Field | Value |
|-------|-------|
| Payload URL | `https://openclaw.your-subdomain.workers.dev/webhook` |
| Content type | `application/json` |
| Secret | Chuỗi secret từ Bước 5 |

4. Ở phần **Which events would you like to trigger this webhook?**
   - Chọn **Let me select individual events**
   - Tick **Pull requests**
   - Bỏ tick các events khác

5. Click **Add webhook**

### Bước 8: Test

1. Tạo một branch mới trong repo
2. Sửa một file code bất kỳ
3. Commit và push
4. Tạo Pull Request

OpenClaw sẽ tự động comment review trong vài giây!

---

## Cấu hình (Tùy chọn)

Tạo file `.openclaw.yml` ở root của repo để tùy chỉnh:

```yaml
version: 1

# Bật/tắt các loại review
review:
  security: true      # Kiểm tra bảo mật
  quality: true       # Kiểm tra chất lượng code
  refactor: true      # Gợi ý refactoring
  tests: true         # Gợi ý test coverage

# Files/folders bỏ qua
ignore:
  - "*.lock"
  - "*.min.js"
  - "dist/**"
  - "node_modules/**"
  - "**/*.generated.*"

# Giới hạn size (tránh timeout)
limits:
  max_files: 20           # Tối đa 20 files
  max_lines_per_file: 500 # Tối đa 500 lines/file
  max_total_lines: 2000   # Tối đa 2000 lines tổng

# Mức độ chi tiết
verbosity: normal  # minimal | normal | detailed
```

---

## Troubleshooting

### Webhook báo lỗi "Invalid signature"

- Kiểm tra secret trên GitHub webhook và secret trong Worker có **giống nhau** không
- Chạy lại: `npx wrangler secret put GITHUB_WEBHOOK_SECRET`

### Comment không xuất hiện trên PR

1. Kiểm tra GitHub Token có quyền `repo` không
2. Kiểm tra Recent Deliveries trong webhook settings
3. Xem logs: `npx wrangler tail`

### PR bị skip

Có thể do vượt quá limits. Kiểm tra:
- Số files changed
- Số lines changed
- Files có match ignore patterns không

### Lỗi "Workers AI"

- Đảm bảo tài khoản Cloudflare đã enable Workers AI
- Free tier: 10,000 neurons/day

---

## Chi phí

| Resource | Free Tier | Sau Free Tier |
|----------|-----------|---------------|
| Workers Requests | 100,000/ngày | $0.50/triệu |
| Workers AI | 10,000 neurons/ngày | ~$0.011/1000 |

**Ước tính:** ~50 PRs/ngày hoàn toàn miễn phí.

---

## Cấu trúc project

```
openclaw/
├── src/
│   ├── index.ts          # Entry point
│   ├── types.ts          # TypeScript types
│   ├── config/           # Config parser
│   ├── github/           # GitHub API
│   ├── filters/          # File filtering
│   ├── review/           # AI review logic
│   └── utils/            # Utilities
├── wrangler.toml         # Worker config
├── package.json
└── tsconfig.json
```

---

## Dùng cho nhiều repos

Cùng một Worker có thể review nhiều repos. Chỉ cần:

1. Vào mỗi repo → Settings → Webhooks → Add webhook
2. Dùng **cùng URL và Secret**
3. Done!

---

## Phát triển

```bash
# Chạy local
npm run dev

# Type check
npm run typecheck

# Deploy
npm run deploy

# Xem logs realtime
npx wrangler tail
```

---

## License

MIT

---

## Đóng góp

Pull requests welcome! Vui lòng đọc [CONTRIBUTING.md](CONTRIBUTING.md) trước khi submit.
