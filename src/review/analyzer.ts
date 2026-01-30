import type { Env, PRPayload, ParsedFile, OpenClawConfig, ReviewResult, SizeCheckResult } from '../types';
import { fetchConfig } from '../config/parser';
import { fetchPRFiles, postComment, findExistingComment, updateComment } from '../github/api';
import { filterFiles } from '../filters/files';
import { checkSizeLimits } from '../filters/size';
import { reviewSecurity } from './security';
import { reviewQuality } from './quality';
import { reviewRefactor } from './refactor';
import { reviewTests } from './tests';
import { formatReviewComment, formatSkipMessage } from '../utils/formatter';

export async function processReview(
  payload: PRPayload,
  env: Env
): Promise<void> {
  const { pull_request: pr, repository: repo } = payload;
  const repoFullName = repo.full_name;
  const prNumber = pr.number;

  try {
    const config = await fetchConfig(repoFullName, pr.head.ref, env.GITHUB_TOKEN);

    const files = await fetchPRFiles(repoFullName, prNumber, env.GITHUB_TOKEN);

    const filteredByPattern = filterFiles(files, config);

    const { filtered, result: sizeResult } = checkSizeLimits(filteredByPattern, config);

    if (!sizeResult.ok) {
      await postOrUpdateComment(
        repoFullName,
        prNumber,
        formatSkipMessage(sizeResult, config),
        env.GITHUB_TOKEN
      );
      return;
    }

    if (filtered.length === 0) {
      await postOrUpdateComment(
        repoFullName,
        prNumber,
        formatNoFilesMessage(),
        env.GITHUB_TOKEN
      );
      return;
    }

    const reviews = await runReviews(filtered, config, env.AI);

    const comment = formatReviewComment(reviews, prNumber, filtered.length, files.length, config);

    await postOrUpdateComment(repoFullName, prNumber, comment, env.GITHUB_TOKEN);
  } catch (error) {
    console.error('Review process failed:', error);
    await postOrUpdateComment(
      repoFullName,
      prNumber,
      formatErrorMessage(error),
      env.GITHUB_TOKEN
    );
  }
}

async function runReviews(
  files: ParsedFile[],
  config: OpenClawConfig,
  ai: Ai
): Promise<ReviewResult[]> {
  const reviewPromises: Promise<ReviewResult>[] = [];

  if (config.review.security) {
    reviewPromises.push(reviewSecurity(files, ai));
  }
  if (config.review.quality) {
    reviewPromises.push(reviewQuality(files, ai));
  }
  if (config.review.refactor) {
    reviewPromises.push(reviewRefactor(files, ai));
  }
  if (config.review.tests) {
    reviewPromises.push(reviewTests(files, ai));
  }

  return Promise.all(reviewPromises);
}

async function postOrUpdateComment(
  repoFullName: string,
  prNumber: number,
  body: string,
  token: string
): Promise<void> {
  const existingCommentId = await findExistingComment(repoFullName, prNumber, token);

  if (existingCommentId) {
    await updateComment(repoFullName, existingCommentId, body, token);
  } else {
    await postComment(repoFullName, prNumber, body, token);
  }
}

function formatNoFilesMessage(): string {
  return `## 🔍 OpenClaw Code Review

No reviewable files found in this PR.

Files may have been filtered out due to:
- Matching ignore patterns
- Unsupported file types
- Deleted files only

---
> ⚡ Powered by [OpenClaw](https://github.com/openclaw/openclaw) on Cloudflare Workers`;
}

function formatErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return `## 🔍 OpenClaw Code Review

❌ **Review failed**

An error occurred while processing this PR:
\`\`\`
${message}
\`\`\`

Please check the webhook configuration and try again.

---
> ⚡ Powered by [OpenClaw](https://github.com/openclaw/openclaw) on Cloudflare Workers`;
}
