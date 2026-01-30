import type { Env, PRPayload } from './types';
import { verifySignature } from './github/webhook';
import { processReview } from './review/analyzer';

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    if (url.pathname !== '/webhook' && url.pathname !== '/') {
      return new Response('Not found', { status: 404 });
    }

    const signature = request.headers.get('x-hub-signature-256');
    const body = await request.text();

    const isValid = await verifySignature(body, signature, env.GITHUB_WEBHOOK_SECRET);
    if (!isValid) {
      return new Response('Invalid signature', { status: 401 });
    }

    const event = request.headers.get('x-github-event');

    if (event === 'ping') {
      return new Response('Pong', { status: 200 });
    }

    if (event !== 'pull_request') {
      return new Response('Ignored event', { status: 200 });
    }

    let payload: PRPayload;
    try {
      payload = JSON.parse(body) as PRPayload;
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    const validActions = ['opened', 'synchronize', 'reopened'];
    if (!validActions.includes(payload.action)) {
      return new Response(`Ignored action: ${payload.action}`, { status: 200 });
    }

    ctx.waitUntil(processReview(payload, env));

    return new Response(
      JSON.stringify({
        status: 'accepted',
        message: 'Review started',
        pr: payload.pull_request.number,
        repo: payload.repository.full_name,
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
