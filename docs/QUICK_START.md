# OpenClaw - Hướng dẫn nhanh 5 phút

## TL;DR

```bash
# 1. Clone và install
git clone https://github.com/your-username/openclaw.git
cd openclaw && npm install

# 2. Login Cloudflare
npx wrangler login

# 3. Deploy
npx wrangler deploy
# => Lưu lại URL: https://openclaw.xxx.workers.dev

# 4. Set secrets
npx wrangler secret put GITHUB_TOKEN      # Paste GitHub PAT
npx wrangler secret put GITHUB_WEBHOOK_SECRET   # Paste webhook secret

# 5. Thêm webhook vào GitHub repo
# Settings → Webhooks → Add webhook
# URL: https://openclaw.xxx.workers.dev/webhook
# Secret: (cùng secret ở bước 4)
# Events: Pull requests

# 6. Tạo PR để test!
```

---

## Checklist

- [ ] Node.js v18+ đã cài
- [ ] Tài khoản Cloudflare (miễn phí)
- [ ] GitHub Personal Access Token với scope `repo`
- [ ] Webhook secret (chuỗi bất kỳ)

---

## Khi gặp lỗi

| Lỗi | Giải pháp |
|-----|-----------|
| Invalid signature | Secret không khớp - kiểm tra lại |
| No comment on PR | Token không có quyền repo |
| PR skipped | Vượt quá limit files/lines |

---

## Links

- Tạo GitHub Token: https://github.com/settings/tokens/new
- Cloudflare Dashboard: https://dash.cloudflare.com
- Xem logs: `npx wrangler tail`
