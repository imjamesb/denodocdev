/**
 * Check whether or not a request was made by Discord Interactions.
 * @param request The request.
 */
export function isRequestByDiscordInteractions(request: Request): boolean {
  return request.headers.has("user-agent") &&
    request.headers.get("user-agent")!.includes("Discord-Interactions");
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

export function readBody(
  request: Request & { _body?: string; _promise?: Promise<null | string> },
): Promise<string | null> {
  if (!request.body) return Promise.resolve(null);
  if (request._body) return Promise.resolve(request._body);
  if (request._promise) return request._promise;
  // deno-lint-ignore no-async-promise-executor
  request._promise = new Promise<string>(async (resolve, reject) => {
    try {
      const reader = request.body!.getReader();
      let str = "";
      let _ = await reader.read();
      while (!_.done) {
        str = new TextDecoder().decode(_.value);
        _ = await reader.read();
      }
      return resolve(request._body = str);
    } catch (error) {
      reject(error);
      request._body = undefined;
    }
  });
  return request._promise;
}

/**
 * Processes a request made by the Discord interactions user-agent.
 * @param request The request.
 */
export async function processDiscordInteractions(
  request: Request,
): Promise<Response> {
  console.log(
    request.method,
    request.url,
    request.headers,
  );
  console.log(await readBody(request));
  return json("OK");
}
