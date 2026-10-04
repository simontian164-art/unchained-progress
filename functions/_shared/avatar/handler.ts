// HTTP layer for the `digital-model` Edge Function. Auth has already been checked by withSupabase;
// this only parses the request, routes it, and makes sure nothing internal leaks into the response.
import type { AvatarDeps, Logger } from "./service.ts";
import { approve, discard, getInfo, getStatus, pollUntilSettled, startGeneration } from "./service.ts";
import type { ApiResult } from "./types.ts";
import { safeDetail } from "./bytes.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACTIONS = new Set(["info", "start", "status", "approve", "discard"]);
const MAX_BODY = 4 * 1024;

/** Structured, image-free logs. Only ids (truncated), codes, counts and timings. */
export const consoleLogger: Logger = (level, event, fields = {}) => {
  const line = JSON.stringify({ level, fn: "digital-model", event, ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
};

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
// `in` checks (not `!r.ok`) so narrowing also works for the app's non-strict tsconfig, which type-checks the integration test
const reply = (r: ApiResult) => ("error" in r ? json({ error: r.error }, r.status) : "info" in r ? json({ info: r.info }) : json({ generation: r.generation }));
const bad = (message: string) => json({ error: { code: "bad_request", message } }, 400);

export async function handleAvatarRequest(
  req: Request,
  userId: string,
  deps: AvatarDeps,
  background: (task: Promise<unknown>) => void,
  poll = { intervalMs: 2500, maxMs: 140_000, sleep: (ms: number) => new Promise<void>((r) => setTimeout(r, ms)) },
): Promise<Response> {
  if (req.method !== "POST") return json({ error: { code: "bad_request", message: "Use POST." } }, 405);
  const text = await req.text();
  if (text.length > MAX_BODY) return bad("Request too large.");
  // deno-lint-ignore no-explicit-any
  let body: any;
  try {
    body = JSON.parse(text || "{}");
  } catch {
    return bad("Invalid JSON.");
  }
  const action = body?.action;
  if (!ACTIONS.has(action)) return bad("Unknown action.");
  const id = body?.id;
  if (id !== undefined && (typeof id !== "string" || !UUID.test(id))) return bad("Invalid id.");
  if ((action === "approve" || action === "discard") && !id) return bad("Missing id.");

  try {
    switch (action) {
      case "info":
        return reply(getInfo(deps));
      case "start": {
        const r = await startGeneration(userId, { consent: body?.consent }, deps);
        // keep the job moving server-side even if the user closes the app
        if (r.ok && "generation" in r && r.generation && ["building", "preserving", "finalizing"].includes(r.generation.stage)) {
          const genId = r.generation.id;
          background(
            pollUntilSettled(userId, genId, deps, poll).catch((e) => deps.log("error", "avatar.poll_crashed", { gen: genId.slice(0, 8), detail: safeDetail(e) })),
          );
        }
        return reply(r);
      }
      case "status":
        return reply(await getStatus(userId, id, deps));
      case "approve":
        return reply(await approve(userId, id, deps));
      case "discard":
        return reply(await discard(userId, id, deps));
    }
  } catch (e) {
    deps.log("error", "avatar.unhandled", { action, detail: safeDetail(e) });
    return json({ error: { code: "unavailable", message: "Something went wrong on our side. Try again in a moment." } }, 500);
  }
  return bad("Unknown action.");
}
