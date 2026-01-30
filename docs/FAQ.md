# FAQ - Câu hỏi thường gặp

## Cài đặt & Deploy

### Q: Cần trả phí không?
**A:** Không, hoàn toàn miễn phí với free tier của Cloudflare:
- Workers: 100K requests/ngày
- Workers AI: 10K neurons/ngày
- Đủ cho ~50 PRs/ngày

### Q: Cần credit card để đăng ký Cloudflare không?
**A:** Không, tài khoản free không cần credit card.

### Q: Deploy lên server riêng được không?
**A:** OpenClaw được thiết kế cho Cloudflare Workers. Nếu muốn self-host, cần viết lại phần AI integration vì Workers AI chỉ chạy trên Cloudflare.

### Q: Hỗ trợ GitLab không?
**A:** Hiện tại chỉ hỗ trợ GitHub. GitLab support nằm trong roadmap.

---

## Sử dụng

### Q: Làm sao để tắt review cho một PR cụ thể?
**A:** Thêm `[skip-review]` hoặc `[no-review]` vào title của PR.

### Q: Review chậm quá, làm sao nhanh hơn?
**A:** Có thể:
1. Dùng model nhỏ hơn (xem [AI_MODELS.md](AI_MODELS.md))
2. Giảm `max_tokens` trong code
3. Tắt bớt review aspects trong `.openclaw.yml`

### Q: PR lớn bị skip, tăng limit được không?
**A:** Được, tạo file `.openclaw.yml`:
```yaml
limits:
  max_files: 50
  max_lines_per_file: 1000
  max_total_lines: 5000
```
⚠️ Cẩn thận: PR quá lớn có thể timeout hoặc tốn nhiều neurons.

### Q: Sao không thấy comment trên PR?
**A:** Kiểm tra:
1. GitHub Token có quyền `repo` không?
2. Webhook secret có khớp không?
3. Xem logs: `npx wrangler tail`
4. Kiểm tra Recent Deliveries trong webhook settings

### Q: Review sai/không chính xác?
**A:** AI không hoàn hảo. Bạn có thể:
1. Dùng model mạnh hơn (DeepSeek-R1 hoặc Claude)
2. Cải thiện prompt trong `src/review/prompts.ts`
3. Thêm context cụ thể cho project

---

## Cấu hình

### Q: File `.openclaw.yml` đặt ở đâu?
**A:** Đặt ở root của repository (cùng cấp với `package.json`, `.gitignore`).

### Q: Không có `.openclaw.yml` thì sao?
**A:** Worker sẽ dùng config mặc định:
- Tất cả review aspects enabled
- Limits: 15 files, 300 lines/file, 1500 total
- Ignore: lock files, node_modules, dist

### Q: Làm sao để chỉ review file TypeScript?
**A:** Thêm vào `.openclaw.yml`:
```yaml
languages:
  - typescript
```

### Q: Ignore thêm folders được không?
**A:** Được:
```yaml
ignore:
  - "vendor/**"
  - "third-party/**"
  - "**/*.generated.ts"
```

---

## AI Models

### Q: Model nào tốt nhất?
**A:** Tùy nhu cầu:
- **Chất lượng cao:** DeepSeek-R1 32B hoặc Claude
- **Cân bằng:** DeepSeek-R1 (security) + DeepSeek-Coder (quality)
- **Nhanh/rẻ:** Llama 3.1 8B hoặc Llama 3.2 3B

### Q: Dùng Claude/GPT được không?
**A:** Được, qua Cloudflare AI Gateway. Xem [AI_MODELS.md](AI_MODELS.md#using-external-apis-claudegpt).

### Q: Free tier hết thì sao?
**A:** Worker vẫn chạy nhưng AI calls sẽ fail. Options:
1. Đợi reset ngày hôm sau
2. Upgrade lên paid plan ($5/month)
3. Dùng external API (Claude/GPT)

### Q: Model nào hỗ trợ tiếng Việt?
**A:** Qwen 2.5 Coder hỗ trợ tiếng Việt tốt nhất.

---

## Security

### Q: Code của tôi có bị lưu không?
**A:** Không. OpenClaw là stateless:
- Không có database
- Không lưu code hay diff
- Chỉ xử lý và trả kết quả

### Q: Token GitHub có an toàn không?
**A:** Token được lưu encrypted trong Cloudflare Secrets, không ai (kể cả bạn) có thể xem lại sau khi set.

### Q: Webhook secret quan trọng không?
**A:** Rất quan trọng! Nó đảm bảo chỉ GitHub mới có thể trigger Worker của bạn.

### Q: Dùng cho private repo được không?
**A:** Được, miễn là GitHub Token có quyền truy cập repo đó.

---

## Troubleshooting

### Q: Lỗi "Invalid signature"
**A:** Webhook secret không khớp. Kiểm tra:
1. Secret trong GitHub webhook settings
2. Secret đã set bằng `wrangler secret put GITHUB_WEBHOOK_SECRET`
3. Phải **giống hệt nhau**

### Q: Lỗi "Failed to fetch PR files"
**A:** GitHub Token không có quyền hoặc hết hạn:
1. Tạo token mới với scope `repo`
2. `npx wrangler secret put GITHUB_TOKEN`

### Q: Lỗi "Workers AI" hoặc model error
**A:**
1. Kiểm tra model ID có đúng không
2. Có thể hết free tier neurons
3. Thử model khác

### Q: Worker không phản hồi
**A:**
1. Kiểm tra URL webhook đúng chưa (có `/webhook` ở cuối)
2. Xem logs: `npx wrangler tail`
3. Test với ping event trong GitHub webhook settings

---

## Khác

### Q: Có API documentation không?
**A:** Worker chỉ có 2 endpoints:
- `POST /webhook` - Nhận GitHub webhooks
- `GET /health` - Health check

### Q: Contribute được không?
**A:** Được! Xem [CONTRIBUTING.md](../CONTRIBUTING.md).

### Q: Có roadmap không?
**A:** Xem [CHANGELOG.md](../CHANGELOG.md) để biết các tính năng đã và sẽ phát triển.

### Q: Liên hệ support ở đâu?
**A:** Mở issue trên GitHub repository.
