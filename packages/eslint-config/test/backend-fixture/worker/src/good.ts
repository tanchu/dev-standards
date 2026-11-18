interface Update {
  message?: { text?: string };
}

function isUpdate(value: unknown): value is Update {
  return typeof value === 'object' && value !== null;
}

async function remember(env: Env, text: string): Promise<void> {
  await env.KV.put('last', text);
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const body: unknown = await request.json();
    if (!isUpdate(body)) {
      return new Response('bad request', { status: 400 });
    }
    const text = body.message?.text ?? '';
    ctx.waitUntil(remember(env, text));
    return Response.json({ ok: true, token: env.BOT_TOKEN.length > 0 });
  },
} satisfies ExportedHandler<Env>;
