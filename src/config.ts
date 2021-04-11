// Exports
export const CLIENT_ID = Deno.env.get("CLIENT_ID")!;
export const CLIENT_PUBLIC_KEY = Deno.env.get("CLIENT_PUBLIC_KEY")!;

if (!CLIENT_ID) throw new Error("Missing client id!");
if (!CLIENT_PUBLIC_KEY) throw new Error("Missing client public key!");
