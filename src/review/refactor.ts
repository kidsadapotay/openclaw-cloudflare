import type { ParsedFile, ReviewResult, ReviewIssue } from '../types';
import { REFACTOR_SYSTEM_PROMPT, buildReviewPrompt } from './prompts';

const MODEL = '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b';

export async function reviewRefactor(
  files: ParsedFile[],
  ai: Ai
): Promise<ReviewResult> {
  const prompt = buildReviewPrompt(
    files.map((f) => ({ filename: f.filename, patch: f.patch })),
    'refactoring opportunities'
  );

  try {
    const response = await ai.run(MODEL, {
      messages: [
        { role: 'system', content: REFACTOR_SYSTEM_PROMPT },
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
      type: 'refactor',
      issues,
    };
  } catch (error) {
    console.error('Refactor review failed:', error);
    return {
      type: 'refactor',
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
