# Hướng dẫn chọn AI Model cho OpenClaw

## Tổng quan

OpenClaw sử dụng Cloudflare Workers AI để chạy các model AI. Bạn có thể thay đổi model tùy theo nhu cầu về chất lượng, tốc độ, và chi phí.

---

## Models hiện có trên Cloudflare Workers AI

### 1. DeepSeek Models (Mặc định)

#### DeepSeek-R1-Distill-Qwen-32B
```
@cf/deepseek-ai/deepseek-r1-distill-qwen-32b
```

| Thuộc tính | Giá trị |
|------------|---------|
| **Kích thước** | 32B parameters |
| **Điểm mạnh** | Reasoning sâu, phân tích phức tạp |
| **Điểm yếu** | Chậm hơn models nhỏ |
| **Dùng cho** | Security review, Refactoring suggestions |
| **Chi phí** | ~0.011$/1K neurons |

#### DeepSeek-Coder-6.7B-Instruct
```
@cf/deepseek-ai/deepseek-coder-6.7b-instruct
```

| Thuộc tính | Giá trị |
|------------|---------|
| **Kích thước** | 6.7B parameters |
| **Điểm mạnh** | Nhanh, chuyên về code |
| **Điểm yếu** | Reasoning không sâu bằng models lớn |
| **Dùng cho** | Quality review, Test coverage |
| **Chi phí** | Rẻ hơn ~5x so với 32B |

---

### 2. Meta Llama Models

#### Llama 3.1 70B Instruct
```
@cf/meta/llama-3.1-70b-instruct
```

| Thuộc tính | Giá trị |
|------------|---------|
| **Kích thước** | 70B parameters |
| **Điểm mạnh** | General-purpose mạnh, context window lớn |
| **Điểm yếu** | Không chuyên về code như DeepSeek-Coder |
| **Dùng cho** | Thay thế DeepSeek-R1 nếu cần |
| **Chi phí** | Cao nhất |

#### Llama 3.1 8B Instruct
```
@cf/meta/llama-3.1-8b-instruct
```

| Thuộc tính | Giá trị |
|------------|---------|
| **Kích thước** | 8B parameters |
| **Điểm mạnh** | Nhanh, cân bằng chất lượng/tốc độ |
| **Điểm yếu** | Không mạnh bằng models lớn |
| **Dùng cho** | Thay thế DeepSeek-Coder nếu cần |
| **Chi phí** | Thấp |

#### Llama 3.2 3B Instruct
```
@cf/meta/llama-3.2-3b-instruct
```

| Thuộc tính | Giá trị |
|------------|---------|
| **Kích thước** | 3B parameters |
| **Điểm mạnh** | Rất nhanh, rẻ nhất |
| **Điểm yếu** | Chất lượng hạn chế |
| **Dùng cho** | Testing, environments có budget thấp |
| **Chi phí** | Rất thấp |

---

### 3. Qwen Models

#### Qwen 2.5 Coder 32B
```
@cf/qwen/qwen2.5-coder-32b-instruct
```

| Thuộc tính | Giá trị |
|------------|---------|
| **Kích thước** | 32B parameters |
| **Điểm mạnh** | Chuyên code, đa ngôn ngữ (hỗ trợ tiếng Việt) |
| **Điểm yếu** | Có thể chậm |
| **Dùng cho** | Alternative cho DeepSeek-R1 |
| **Chi phí** | Tương đương DeepSeek-R1 |

---

### 4. Mistral Models

#### Mistral 7B Instruct
```
@cf/mistral/mistral-7b-instruct-v0.2
```

| Thuộc tính | Giá trị |
|------------|---------|
| **Kích thước** | 7B parameters |
| **Điểm mạnh** | Hiệu quả, balance tốt |
| **Điểm yếu** | Không chuyên code |
| **Dùng cho** | General purpose tasks |
| **Chi phí** | Thấp |

---

## So sánh Models

### Theo chất lượng Code Review

| Model | Security | Quality | Refactor | Tests | Overall |
|-------|----------|---------|----------|-------|---------|
| DeepSeek-R1 32B | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **Best** |
| Qwen 2.5 Coder 32B | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Excellent |
| Llama 3.1 70B | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Very Good |
| DeepSeek-Coder 6.7B | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Good |
| Llama 3.1 8B | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Good |
| Mistral 7B | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | Fair |
| Llama 3.2 3B | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ | Basic |

### Theo tốc độ

| Model | Thời gian trung bình |
|-------|---------------------|
| Llama 3.2 3B | ~1-2s |
| DeepSeek-Coder 6.7B | ~2-4s |
| Mistral 7B | ~2-4s |
| Llama 3.1 8B | ~3-5s |
| DeepSeek-R1 32B | ~5-10s |
| Qwen 2.5 Coder 32B | ~5-10s |
| Llama 3.1 70B | ~8-15s |

### Theo chi phí (neurons/request)

| Model | Neurons ước tính |
|-------|-----------------|
| Llama 3.2 3B | ~500 |
| Mistral 7B | ~1,000 |
| DeepSeek-Coder 6.7B | ~1,200 |
| Llama 3.1 8B | ~1,500 |
| DeepSeek-R1 32B | ~5,000 |
| Qwen 2.5 Coder 32B | ~5,500 |
| Llama 3.1 70B | ~10,000 |

**Free tier:** 10,000 neurons/ngày

---

## Cách thay đổi Model

### Sửa trong code

Mở file `src/review/*.ts` và thay đổi constant `MODEL`:

```typescript
// src/review/security.ts
// Mặc định
const MODEL = '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b';

// Thay bằng Qwen
const MODEL = '@cf/qwen/qwen2.5-coder-32b-instruct';

// Hoặc Llama
const MODEL = '@cf/meta/llama-3.1-70b-instruct';
```

### Cấu hình cho từng loại review

Khuyến nghị sử dụng models khác nhau cho từng task:

```typescript
// src/review/models.ts
export const MODELS = {
  // Tasks cần reasoning sâu → dùng model lớn
  security: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
  refactor: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',

  // Tasks cần nhanh → dùng model nhỏ chuyên code
  quality: '@cf/deepseek-ai/deepseek-coder-6.7b-instruct',
  tests: '@cf/deepseek-ai/deepseek-coder-6.7b-instruct',
};
```

---

## Recommended Configurations

### 1. Chất lượng cao nhất (Chậm, tốn neurons)

```typescript
const MODELS = {
  security: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
  quality: '@cf/qwen/qwen2.5-coder-32b-instruct',
  refactor: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
  tests: '@cf/qwen/qwen2.5-coder-32b-instruct',
};
```
- **Ưu điểm:** Review chất lượng nhất
- **Nhược điểm:** ~15-30s/PR, ~20K neurons/PR
- **Phù hợp:** Production, critical projects

### 2. Cân bằng (Mặc định)

```typescript
const MODELS = {
  security: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
  quality: '@cf/deepseek-ai/deepseek-coder-6.7b-instruct',
  refactor: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
  tests: '@cf/deepseek-ai/deepseek-coder-6.7b-instruct',
};
```
- **Ưu điểm:** Balance chất lượng/tốc độ
- **Nhược điểm:** ~10-15s/PR, ~12K neurons/PR
- **Phù hợp:** Hầu hết projects

### 3. Nhanh và rẻ

```typescript
const MODELS = {
  security: '@cf/meta/llama-3.1-8b-instruct',
  quality: '@cf/deepseek-ai/deepseek-coder-6.7b-instruct',
  refactor: '@cf/meta/llama-3.1-8b-instruct',
  tests: '@cf/deepseek-ai/deepseek-coder-6.7b-instruct',
};
```
- **Ưu điểm:** Nhanh, ít tốn neurons
- **Nhược điểm:** Chất lượng thấp hơn
- **Phù hợp:** Testing, low-priority projects

### 4. Siêu tiết kiệm

```typescript
const MODELS = {
  security: '@cf/meta/llama-3.2-3b-instruct',
  quality: '@cf/meta/llama-3.2-3b-instruct',
  refactor: '@cf/meta/llama-3.2-3b-instruct',
  tests: '@cf/meta/llama-3.2-3b-instruct',
};
```
- **Ưu điểm:** Rất nhanh, rất rẻ
- **Nhược điểm:** Chất lượng cơ bản
- **Phù hợp:** Demo, testing pipeline

---

## Sử dụng Claude/GPT (External API)

Nếu muốn chất lượng cao hơn, có thể dùng Cloudflare AI Gateway để proxy đến Claude hoặc GPT:

### Setup AI Gateway

1. Vào Cloudflare Dashboard → AI → AI Gateway
2. Tạo gateway mới
3. Lấy Gateway URL

### Sử dụng Claude

```typescript
// src/review/security.ts
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

### Chi phí Claude API

| Model | Input | Output |
|-------|-------|--------|
| Claude Sonnet | $3/1M tokens | $15/1M tokens |
| Claude Opus | $15/1M tokens | $75/1M tokens |
| Claude Haiku | $0.25/1M tokens | $1.25/1M tokens |

**Ước tính:** ~$0.01-0.05/PR với Claude Sonnet

---

## FAQ

### Q: Model nào tốt nhất cho Security review?
**A:** DeepSeek-R1 32B hoặc Qwen 2.5 Coder 32B. Cả hai đều có reasoning tốt để phát hiện vulnerabilities.

### Q: Tại sao không dùng cùng 1 model cho tất cả?
**A:** Để tối ưu cost/speed. Tasks đơn giản (quality, tests) không cần model lớn.

### Q: Model nào hỗ trợ tiếng Việt tốt nhất?
**A:** Qwen 2.5 được train với dữ liệu đa ngôn ngữ, hỗ trợ tiếng Việt tốt hơn.

### Q: Free tier đủ dùng không?
**A:** 10K neurons/ngày ~ 5-10 PRs với config mặc định. Đủ cho personal/small team.

### Q: Khi nào nên dùng Claude/GPT?
**A:** Khi cần chất lượng review cao nhất, hoặc Workers AI models không đáp ứng được yêu cầu đặc biệt.

---

## Troubleshooting

### Model không có trong types

Thêm `// @ts-expect-error` trước dòng gọi model:

```typescript
// @ts-expect-error - Model not in types yet
const response = await ai.run(MODEL, { ... });
```

### Model timeout

- Giảm `max_tokens` xuống 1000-1500
- Chuyển sang model nhỏ hơn
- Tăng size limits để giảm input

### Kết quả không chính xác

- Thử model lớn hơn
- Cải thiện prompt trong `src/review/prompts.ts`
- Thêm ví dụ vào system prompt
