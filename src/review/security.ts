import type { ParsedFile, ReviewResult, ReviewIssue } from '../types';
import { SECURITY_SYSTEM_PROMPT, buildReviewPrompt } from './prompts';

const MODEL = '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b';

export async function reviewSecurity(
  files: ParsedFile[],
  ai: Ai
): Promise<ReviewResult> {
  const prompt = buildReviewPrompt(
    files.map((f) => ({ filename: f.filename, patch: f.patch })),
    'security'
  );

  try {
    const response = await ai.run(MODEL, {
      messages: [
        { role: 'system', content: SECURITY_SYSTEM_PROMPT },
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
      type: 'security',
      issues,
    };
  } catch (error) {
    console.error('Security review failed:', error);
    return {
      type: 'security',
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
