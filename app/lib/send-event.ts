import { inngest } from "@/app/inngest/client";

export function inngestErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Failed to send event";
  const cause =
    error instanceof Error && "cause" in error ? String(error.cause ?? "") : "";

  if (
    message.includes("fetch failed") ||
    message.includes("ECONNREFUSED") ||
    cause.includes("ECONNREFUSED")
  ) {
    return "Inngest Dev Server is not running. In another terminal run: npx inngest-cli@latest dev";
  }

  return message;
}

export async function sendEvent(name: string, data: Record<string, unknown>) {
  return inngest.send({ name, data });
}
