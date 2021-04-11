// Imports
import nacl from "https://cdn.skypack.dev/tweetnacl@v1.0.3";
import { CLIENT_PUBLIC_KEY } from "./config.ts";

/**
 * Check whether or not a request was made by Discord Interactions.
 * @param request The request.
 */
export function isRequestByDiscordInteractions(request: Request): boolean {
  return request.method === "POST" && request.headers.has("user-agent") &&
    request.headers.get("user-agent")!.includes("Discord-Interactions") &&
    request.headers.has("X-Signature-Ed25519") &&
    request.headers.has("X-Signature-Timestamp");
}

export type JSONData =
  | undefined
  | null
  | string
  | boolean
  | number
  | JSONAr
  | JSONRe;
type JSONAr = JSONData[];
type JSONRe = { [key: string]: JSONData };

/**
 * Create a JSON response.
 * @param data The JSON data to respond with.
 * @param init The response initialiation parameters.
 * @returns A JSON response object.
 */
export function json(data: JSONData, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");
  return new Response(JSON.stringify(data), {
    statusText: init?.statusText ?? "OK",
    status: init?.status ?? 200,
    headers,
  });
}

/**
 * Processes a request made by the Discord interactions user-agent.
 * @param request The request.
 */
export async function processDiscordInteractions(
  request: Request,
): Promise<Response> {
  const { valid, body } = await verifySignature(request);

  if (!valid) {
    return json({ error: "Invalid request." }, { status: 401 });
  }

  const { type = 0, data = { options: [] } } = JSON.parse(body);

  // Respond to ping interaction.
  if (type === 1) {
    console.debug("Processing!");
    return json({
      type: 1,
    });
  }

  // Bad request, nothing else to do.
  return json({ error: "Bad request." }, { status: 400 });
}

/**
 * Verify whether the request is coming from Discord.
 * 
 * Copied from [deno
 * documentation](https://deno.com/deploy/docs/tutorial-discord-slash).
 */
async function verifySignature(
  request: Request,
): Promise<{ valid: boolean; body: string }> {
  // Discord sends these headers with every request.
  const signature = request.headers.get("X-Signature-Ed25519")!;
  const timestamp = request.headers.get("X-Signature-Timestamp")!;
  const body = await request.text();
  const valid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + body),
    hexToUint8Array(signature),
    hexToUint8Array(CLIENT_PUBLIC_KEY),
  );

  return { valid, body };
}

/** Converts a hexadecimal string to Uint8Array. */
function hexToUint8Array(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)));
}
