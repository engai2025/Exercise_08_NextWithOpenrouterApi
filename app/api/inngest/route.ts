// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "../../inngest/client";
// We'll add functions here as we create them

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Functions will be added here
  ],
});
