// Imports
import { serve } from "https://deno.land/x/sift@0.2.0/mod.ts";

serve({
  "/": () => new Response("Hello world"),
});
