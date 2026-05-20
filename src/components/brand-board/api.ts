export class ApiError extends Error {
  status: number;
  payload: Record<string, unknown> | null;

  constructor(message: string, status: number, payload: Record<string, unknown> | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const fetchWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 300
): Promise<T> => {
  try {
    return await fn();
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    const isHttpError = err instanceof ApiError;
    const isRetryable = !isAbort && (!isHttpError || err.status >= 500);

    if (retries <= 0 || !isRetryable) throw err;

    const nextDelay = delay * 2 + Math.random() * 100;
    await sleep(nextDelay);

    return fetchWithBackoff(fn, retries - 1, nextDelay);
  }
};

export async function analyzeBrand(
  messages: { role: string; content: string }[],
  signal?: AbortSignal
) {
  const response = await fetch("/api/brand-analysis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error?.message || "Brand analysis failed",
      response.status,
      data
    );
  }

  const reply = data.content?.find((b: { type: string }) => b.type === "text")?.text;
  if (!reply) {
    throw new ApiError("Unexpected API response format", 200, data);
  }

  return reply;
}
