# Changelog

Tất cả thay đổi đáng chú ý của OpenClaw sẽ được ghi lại trong file này.

Format dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
và project này tuân theo [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-01-30

### 🎉 Initial Release

Phiên bản đầu tiên của OpenClaw - AI Code Review trên Cloudflare Workers.

### Added

- **Core Features**
  - Tự động review PR khi có webhook từ GitHub
  - 4 khía cạnh review: Security, Quality, Refactoring, Test Coverage
  - Comment trực tiếp trên PR với format markdown đẹp

- **AI Integration**
  - Hỗ trợ Cloudflare Workers AI
  - Default models: DeepSeek-R1 (32B) và DeepSeek-Coder (6.7B)
  - Hỗ trợ thay đổi sang các models khác: Llama, Qwen, Mistral
  - Hướng dẫn dùng Claude/GPT qua AI Gateway

- **Configuration**
  - File `.openclaw.yml` để tùy chỉnh per-repo
  - Ignore patterns (glob syntax)
  - Size limits để tránh timeout
  - Verbosity levels: minimal, normal, detailed

- **Security**
  - Webhook signature verification (HMAC-SHA256)
  - Secrets stored encrypted trong Cloudflare

- **Documentation**
  - README.md với hướng dẫn đầy đủ
  - Quick Start guide (5 phút)
  - AI Models comparison guide
  - Architecture documentation
  - FAQ
  - Contributing guide

### Technical Details

- Platform: Cloudflare Workers
- Language: TypeScript
- AI: Cloudflare Workers AI (DeepSeek models)
- Storage: Stateless (không cần database)

---

## [Unreleased]

### Planned Features

- [ ] **GitLab Support** - Webhook integration cho GitLab
- [ ] **Inline Comments** - Comment trên từng line thay vì 1 comment tổng
- [ ] **Dashboard** - Web UI để xem history và analytics (R2 + D1)
- [ ] **Custom Prompts** - Cho phép tùy chỉnh AI prompts trong config
- [ ] **Rate Limiting** - Queue management cho large organizations
- [ ] **Slack/Discord Notifications** - Thông báo kết quả review
- [ ] **Auto-fix Suggestions** - Gợi ý code fix có thể apply trực tiếp

### Potential Improvements

- [ ] Support thêm ngôn ngữ lập trình
- [ ] Caching để tránh review lại code không đổi
- [ ] Batch processing cho PR rất lớn
- [ ] A/B testing giữa các AI models
- [ ] Metrics và observability

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 1.0.0 | 2026-01-30 | Initial release |

---

## Upgrade Guide

### Upgrading to 1.x

Đây là version đầu tiên, không cần upgrade từ version trước.

### Future Upgrades

Khi có breaking changes, sẽ có hướng dẫn chi tiết ở đây.

---

## Contributing

Xem [CONTRIBUTING.md](CONTRIBUTING.md) để biết cách đóng góp.

Mỗi PR sẽ được ghi nhận trong changelog của version tiếp theo.
