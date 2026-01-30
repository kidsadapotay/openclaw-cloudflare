import type { ReviewResult, ReviewIssue, OpenClawConfig, SizeCheckResult } from '../types';

const SEVERITY_ICONS: Record<string, string> = {
  high: '🔴',
  medium: '🟡',
  low: '🟢',
};

const SECTION_ICONS: Record<string, string> = {
  security: '🔒',
  quality: '✨',
  refactor: '♻️',
  tests: '🧪',
};

const SECTION_TITLES: Record<string, string> = {
  security: 'Security',
  quality: 'Code Quality',
  refactor: 'Refactoring Suggestions',
  tests: 'Test Coverage',
};

export function formatReviewComment(
  reviews: ReviewResult[],
  prNumber: number,
  filesReviewed: number,
  totalFiles: number,
  config: OpenClawConfig
): string {
  const totalIssues = reviews.reduce((sum, r) => sum + r.issues.length, 0);
  const highCount = reviews.reduce(
    (sum, r) => sum + r.issues.filter((i) => i.severity === 'high').length,
    0
  );

  let comment = `## 🔍 OpenClaw Code Review\n\n`;
  comment += `**PR:** #${prNumber} | **Files reviewed:** ${filesReviewed}/${totalFiles}`;

  if (totalIssues === 0) {
    comment += `\n\n✅ **No issues found!** Great job!\n`;
  } else {
    comment += ` | **Issues:** ${totalIssues}`;
    if (highCount > 0) {
      comment += ` (${highCount} high severity)`;
    }
    comment += `\n`;
  }

  comment += `\n---\n`;

  for (const review of reviews) {
    if (review.issues.length === 0 && config.verbosity === 'minimal') {
      continue;
    }

    comment += formatSection(review, config.verbosity);
  }

  comment += formatConfigDetails(config, reviews);
  comment += `\n---\n`;
  comment += `> ⚡ Powered by [OpenClaw](https://github.com/openclaw/openclaw) on Cloudflare Workers`;

  return comment;
}

function formatSection(
  review: ReviewResult,
  verbosity: OpenClawConfig['verbosity']
): string {
  const icon = SECTION_ICONS[review.type];
  const title = SECTION_TITLES[review.type];

  let section = `\n### ${icon} ${title}\n`;

  if (review.issues.length === 0) {
    section += `✅ No issues found\n`;
    return section;
  }

  const highIssues = review.issues.filter((i) => i.severity === 'high');
  const mediumIssues = review.issues.filter((i) => i.severity === 'medium');
  const lowIssues = review.issues.filter((i) => i.severity === 'low');

  if (highIssues.length > 0 || mediumIssues.length > 0) {
    section += `| Severity | File | Line | Issue |\n`;
    section += `|----------|------|------|-------|\n`;

    for (const issue of [...highIssues, ...mediumIssues]) {
      section += formatTableRow(issue);
    }
    section += `\n`;
  }

  if (lowIssues.length > 0 && verbosity !== 'minimal') {
    if (verbosity === 'detailed') {
      section += `**Minor suggestions:**\n`;
      for (const issue of lowIssues) {
        section += formatBulletPoint(issue);
      }
    } else {
      section += `<details>\n<summary>📋 ${lowIssues.length} minor suggestions</summary>\n\n`;
      for (const issue of lowIssues) {
        section += formatBulletPoint(issue);
      }
      section += `</details>\n`;
    }
  }

  return section;
}

function formatTableRow(issue: ReviewIssue): string {
  const icon = SEVERITY_ICONS[issue.severity];
  const severity = issue.severity.toUpperCase();
  const line = issue.line ?? '-';
  const message = issue.suggestion
    ? `${issue.message} → ${issue.suggestion}`
    : issue.message;

  return `| ${icon} ${severity} | \`${issue.file}\` | ${line} | ${escapeMarkdown(message)} |\n`;
}

function formatBulletPoint(issue: ReviewIssue): string {
  const location = issue.line ? `${issue.file}:${issue.line}` : issue.file;
  const message = issue.suggestion
    ? `${issue.message} → ${issue.suggestion}`
    : issue.message;

  return `- **\`${location}\`** - ${escapeMarkdown(message)}\n`;
}

function formatConfigDetails(
  config: OpenClawConfig,
  reviews: ReviewResult[]
): string {
  const enabledAspects = Object.entries(config.review)
    .filter(([_, enabled]) => enabled)
    .map(([aspect]) => aspect);

  const aspectStatus = enabledAspects.map((a) => `${a}: ✓`).join(' | ');

  return `
<details>
<summary>📋 Review Config</summary>

\`\`\`
${aspectStatus}
verbosity: ${config.verbosity}
limits: ${config.limits.max_files} files, ${config.limits.max_lines_per_file} lines/file
\`\`\`
</details>
`;
}

export function formatSkipMessage(
  result: SizeCheckResult,
  config: OpenClawConfig
): string {
  let comment = `## 🔍 OpenClaw Code Review\n\n`;
  comment += `⏭️ **Review skipped**\n\n`;
  comment += `${result.reason}\n\n`;
  comment += `**Current limits:**\n`;
  comment += `- Max files: ${config.limits.max_files}\n`;
  comment += `- Max lines per file: ${config.limits.max_lines_per_file}\n`;
  comment += `- Max total lines: ${config.limits.max_total_lines}\n\n`;

  if (result.stats.skippedFiles.length > 0) {
    comment += `<details>\n<summary>Skipped files (${result.stats.skippedFiles.length})</summary>\n\n`;
    for (const file of result.stats.skippedFiles) {
      comment += `- ${file}\n`;
    }
    comment += `</details>\n`;
  }

  comment += `\n---\n`;
  comment += `> ⚡ Powered by [OpenClaw](https://github.com/openclaw/openclaw) on Cloudflare Workers`;

  return comment;
}

function escapeMarkdown(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
