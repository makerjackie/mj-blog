import "@tanstack/react-start/server-only";
import { parseJson } from "@repo/core";
import { env } from "cloudflare:workers";

type AiChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type AiChatCompletionResult =
  | {
      ok: true;
      content: string;
    }
  | {
      ok: false;
      error: string;
      status?: number;
    };

export async function createConfiguredChatCompletion(input: {
  messages: AiChatMessage[];
  timeoutMs?: number;
  temperature?: number;
  maxTokens?: number;
}): Promise<AiChatCompletionResult> {
  const baseUrl = env.CMS_AI_BASE_URL?.trim().replace(/\/+$/, "") ?? "";
  const apiKey = env.CMS_AI_API_KEY?.trim() ?? "";
  const model = env.CMS_AI_MODEL?.trim() ?? "";

  if (!baseUrl || !apiKey || !model) {
    return {
      ok: false,
      error: "AI provider is not configured in the Worker environment.",
    };
  }

  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, input.timeoutMs ?? 20_000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      body: JSON.stringify({
        model,
        messages: input.messages,
        temperature: input.temperature,
        max_tokens: input.maxTokens,
      }),
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      method: "POST",
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        error: providerError(payload) ?? `AI provider returned HTTP ${response.status}.`,
        status: response.status,
      };
    }

    const content = readCompletionContent(payload);

    return content
      ? { ok: true, content }
      : {
          ok: false,
          error: "AI provider returned an empty completion.",
          status: response.status,
        };
  } catch (error) {
    return {
      ok: false,
      error: timedOut
        ? "AI provider request timed out."
        : error instanceof Error
          ? error.message
          : "AI provider request failed.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function parseAiJsonObject(content: string) {
  const trimmed = content.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
  const candidate = fenced?.[1]?.trim() ?? extractJsonObject(trimmed) ?? trimmed;

  return parseJson<Record<string, unknown>>(candidate);
}

function readCompletionContent(payload: unknown) {
  if (!isRecord(payload) || !Array.isArray(payload.choices)) {
    return "";
  }

  const first = payload.choices[0];

  return isRecord(first) && isRecord(first.message) && typeof first.message.content === "string"
    ? first.message.content.trim()
    : "";
}

function providerError(payload: unknown) {
  if (!isRecord(payload)) {
    return null;
  }

  if (typeof payload.error === "string") {
    return payload.error;
  }

  return isRecord(payload.error) && typeof payload.error.message === "string"
    ? payload.error.message
    : null;
}

function extractJsonObject(value: string) {
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");

  return start >= 0 && end > start ? value.slice(start, end + 1) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
