import type { ParsedFile, ReviewResult, ReviewIssue } from '../types';
import { QUALITY_SYSTEM_PROMPT, buildReviewPrompt } from './prompts';

const MODEL = '@cf/deepseek-ai/deepseek-coder-6.7b-instruct' as const;

export async function reviewQuality(
  files: ParsedFile[],
  ai: Ai
): Promise<ReviewResult> {
  const prompt = buildReviewPrompt(
    files.map((f) => ({ filename: f.filename, patch: f.patch })),
    'code quality'
  );

  try {
    // @ts-expect-error - DeepSeek model not in types yet
    const response = await ai.run(MODEL, {
      messages: [
        { role: 'system', content: QUALITY_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
    });

    const text =
      typeof response === 'string'
        ? response
        : (response as { response?: string }).response ?? '[]';

    const issues = parseAIResponse(text);

    return {
      type: 'quality',
      issues,
    };
  } catch (error) {
    console.error('Quality review failed:', error);
    return {
      type: 'quality',
      issues: [],
    };
  }
}

function parseAIResponse(text: string): ReviewIssue[] {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]) as ReviewIssue[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
