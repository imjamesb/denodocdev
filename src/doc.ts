// Imports
import {
  isRequestByDiscordInteractions,
  json,
  processDiscordInteractions,
} from "./utils.ts";

/**
 * Deno Deploy dispatches a `FetchEvent` to your script when a new request is
 * made towards your deployment. The event, represented by the string `fetch`,
 * contains the details of the incoming request and methods to respond to the
 * same request.
 */
interface FetchEvent extends Event {
  /** Represents the incoming request to your deployment. */
  readonly request: Request;

  /**
   * A method to respond to the incoming request.
   * @param response The response to send back to the client.
   */
  respondWith(response: Promise<Response> | Response): void;
}

addEventListener("fetch", (evt: FetchEvent) => {
  const { request } = evt;
  try {
    if (isRequestByDiscordInteractions(request)) {
      return evt.respondWith(processDiscordInteractions(request));
    }
    return evt.respondWith(
      json("Not found", { status: 404, statusText: "Not found." }),
    );
  } catch (error) {
    if (error instanceof Error) {
      evt.respondWith(
        json({ message: error.message, name: error.name, stack: error.stack }, {
          status: 500,
          statusText: "Internal server error.",
        }),
      );
    }
  }
});
