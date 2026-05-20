import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const request = context.request;
  const apiKey = (context.locals as any).runtime?.env?.ANTHROPIC_API_KEY || import.meta.env.ANTHROPIC_API_KEY;
  const baseUrl = (context.locals as any).runtime?.env?.ANTHROPIC_BASE_URL || import.meta.env.ANTHROPIC_BASE_URL || "https://openrouter.ai/api";

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: { type: "config_error", message: "API key not configured on server" },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await request.json();
    const rawMessages: { role: string; content: string }[] = body.messages;

    if (!rawMessages || !Array.isArray(rawMessages)) {
      return new Response(
        JSON.stringify({ error: { type: "invalid_request", message: "messages array required" } }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-flash",
        max_tokens: 4096,
        messages: rawMessages,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const rawText = await response.text();
    const data = JSON.parse(rawText);

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: { type: data.error?.code || "api_error", message: data.error?.message || "API error" },
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const replyText = data.choices?.[0]?.message?.content || "";

    const anthropicFormat = {
      content: [{ type: "text", text: replyText }],
    };

    return new Response(JSON.stringify(anthropicFormat), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: { type: "server_error", message: err instanceof Error ? err.message : "Unknown server error" },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
