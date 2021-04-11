// Imports
import {
  isRequestByDiscordInteractions,
  json,
  processDiscordInteractions,
} from "./utils.ts";

addEventListener("fetch", (evt) => {
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
