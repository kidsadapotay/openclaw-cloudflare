# Contributing to OpenClaw

Cảm ơn bạn đã quan tâm đến việc đóng góp cho OpenClaw! 🎉

## Cách đóng góp

### 1. Báo lỗi (Bug Reports)

Nếu bạn tìm thấy bug:

1. Kiểm tra [Issues](https://github.com/your-username/openclaw/issues) xem đã có ai báo chưa
2. Nếu chưa, tạo issue mới với template:

```markdown
## Mô tả lỗi
[Mô tả ngắn gọn lỗi gì]

## Cách tái hiện
1. Bước 1
2. Bước 2
3. ...

## Kết quả mong đợi
[Bạn expect điều gì xảy ra]

## Kết quả thực tế
[Thực tế điều gì xảy ra]

## Environment
- Node version:
- Wrangler version:
- OS:

## Logs
[Paste logs từ `npx wrangler tail` nếu có]
```

### 2. Đề xuất tính năng (Feature Requests)

1. Kiểm tra [Issues](https://github.com/your-username/openclaw/issues) xem đã có ai đề xuất chưa
2. Tạo issue với label `enhancement`
3. Mô tả rõ:
   - Tính năng muốn thêm
   - Lý do cần tính năng này
   - Cách implement (nếu có ý tưởng)

### 3. Gửi Pull Request

#### Setup môi trường

```bash
# Fork repo trên GitHub

# Clone fork của bạn
git clone https://github.com/YOUR_USERNAME/openclaw.git
cd openclaw

# Thêm upstream remote
git remote add upstream https://github.com/original/openclaw.git

# Install dependencies
npm install
```

#### Workflow

```bash
# Sync với upstream
git fetch upstream
git checkout main
git merge upstream/main

# Tạo branch mới
git checkout -b feature/ten-tinh-nang

# Code...

# Chạy type check
npm run typecheck

# Commit
git add .
git commit -m "feat: mô tả tính năng"

# Push
git push origin feature/ten-tinh-nang
```

#### Tạo Pull Request

1. Vào GitHub, tạo PR từ branch của bạn
2. Điền template PR:

```markdown
## Mô tả
[Mô tả thay đổi của bạn]

## Loại thay đổi
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Checklist
- [ ] Code đã chạy typecheck pass
- [ ] Đã test local
- [ ] Đã update docs (nếu cần)
```

---

## Coding Standards

### TypeScript

- Sử dụng TypeScript strict mode
- Không dùng `any` trừ khi thực sự cần
- Export types từ `types.ts`

### Code Style

- Indent: 2 spaces
- Quotes: single quotes
- Semicolons: required
- Max line length: 100

```typescript
// ✅ Good
const result = await fetchData('api/data');

// ❌ Bad
const result=await fetchData("api/data")
```

### Naming

```typescript
// Files: kebab-case
// src/review/security-check.ts

// Functions: camelCase
function processReview() {}

// Types/Interfaces: PascalCase
interface ReviewResult {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_FILES = 15;
```

### Commits

Sử dụng [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug
docs: update documentation
refactor: refactor code
test: add tests
chore: maintenance
```

---

## Project Structure

```
openclaw/
├── src/
│   ├── index.ts          # Entry point - chỉnh sửa cẩn thận
│   ├── types.ts          # Types - thêm types mới ở đây
│   ├── config/           # Config parsing
│   ├── github/           # GitHub API integration
│   ├── filters/          # File filtering logic
│   ├── review/           # AI review logic - thường sửa ở đây
│   └── utils/            # Utilities
├── docs/                 # Documentation
└── wrangler.toml         # Worker config
```

### Khi thêm tính năng mới

1. **Thêm type** vào `src/types.ts`
2. **Implement logic** trong folder phù hợp
3. **Update config** nếu cần thêm options
4. **Update docs** trong `docs/`

---

## Testing

### Local testing

```bash
# Chạy dev server
npm run dev

# Test với curl
curl -X POST http://localhost:8787/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: ping" \
  -d '{"zen": "test"}'
```

### Test với real webhook

1. Deploy preview: `npx wrangler deploy --env preview`
2. Setup webhook với preview URL
3. Tạo test PR

---

## Documentation

Khi thay đổi tính năng, update docs tương ứng:

| Thay đổi | Update |
|----------|--------|
| Thêm config option | `README.md`, `.openclaw.example.yml` |
| Thêm AI model | `docs/AI_MODELS.md` |
| Thay đổi architecture | `docs/ARCHITECTURE.md` |
| Bug fixes | `CHANGELOG.md` |

---

## Review Process

1. Maintainer sẽ review PR trong 1-3 ngày
2. Có thể yêu cầu thay đổi
3. Sau khi approve, sẽ merge vào `main`
4. Tính năng sẽ được deploy trong release tiếp theo

---

## Code of Conduct

- Tôn trọng lẫn nhau
- Constructive feedback
- Không spam, không self-promotion
- English hoặc Vietnamese đều ok

---

## Cần giúp đỡ?

- Mở issue với label `question`
- Hoặc mention maintainer trong PR

Cảm ơn bạn đã đóng góp! 🙏
