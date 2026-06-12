// xAI Grok client. The xAI API is OpenAI-compatible, so we hit
// /v1/chat/completions with a Bearer token. Using fetch directly avoids
// pulling in the OpenAI SDK just for one endpoint.
//
// Set XAI_API_KEY in .env.local. The model is configurable via XAI_MODEL
// (defaults to grok-4-latest, the recommended model alias as of 2026-05).

const XAI_BASE_URL = "https://api.x.ai/v1";

export type GrokMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string };

export type GrokOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json_object";
  // If set, the request is retried up to N times on 429/5xx with
  // exponential backoff. Defaults to 3.
  maxRetries?: number;
};

export type GrokResponse = {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export class GrokError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string
  ) {
    super(message);
    this.name = "GrokError";
  }
}

function getApiKey(): string {
  const key = process.env.XAI_API_KEY;
  if (!key) {
    throw new Error(
      "XAI_API_KEY is not set. Add it to .env.local. The full content " +
        "pipeline is ready and will run as soon as the key is provided."
    );
  }
  return key;
}

function getModel(): string {
  return process.env.XAI_MODEL ?? "grok-4-latest";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function grokChat(
  messages: GrokMessage[],
  options: GrokOptions = {}
): Promise<GrokResponse> {
  const apiKey = getApiKey();
  const model = options.model ?? getModel();
  const maxRetries = options.maxRetries ?? 3;

  const body = {
    model,
    messages,
    temperature: options.temperature ?? 0.4,
    max_tokens: options.maxTokens ?? 4096,
    ...(options.responseFormat === "json_object"
      ? { response_format: { type: "json_object" as const } }
      : {}),
  };

  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${XAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        // Retry transient errors only.
        if ((res.status === 429 || res.status >= 500) && attempt < maxRetries) {
          const wait = 1000 * 2 ** attempt;
          await sleep(wait);
          continue;
        }
        throw new GrokError(
          `xAI request failed (${res.status}): ${text.slice(0, 500)}`,
          res.status,
          text
        );
      }

      const json = (await res.json()) as {
        choices: Array<{ message: { content: string } }>;
        usage: GrokResponse["usage"];
      };
      const content = json.choices[0]?.message?.content;
      if (!content) {
        throw new Error("xAI returned empty content");
      }
      return { content, usage: json.usage };
    } catch (err) {
      lastErr = err;
      if (err instanceof GrokError) throw err;
      if (attempt >= maxRetries) throw err;
      await sleep(1000 * 2 ** attempt);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Unknown xAI error");
}

// JSON-mode wrapper. Asks Grok for a JSON object response and parses it.
export async function grokJson<T = unknown>(
  messages: GrokMessage[],
  options: GrokOptions = {}
): Promise<{ data: T; usage: GrokResponse["usage"] }> {
  const res = await grokChat(messages, {
    ...options,
    responseFormat: "json_object",
  });
  try {
    return { data: JSON.parse(res.content) as T, usage: res.usage };
  } catch (err) {
    throw new Error(
      `xAI returned non-JSON response despite json_object format: ${
        (err as Error).message
      }\n---\n${res.content.slice(0, 1000)}`
    );
  }
}
