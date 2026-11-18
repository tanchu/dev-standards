let counter = 0;

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const body = (await request.json()) as any;
    const token = process.env.BOT_TOKEN;
    env.KV.put('last', body.message!.text);
    try {
      counter += 1;
    } catch (e) {}
    // @ts-ignore
    ctx.waitUntil(token);
    return new Response(String(counter));
  },
} satisfies ExportedHandler<Env>;
