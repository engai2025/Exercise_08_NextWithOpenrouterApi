import { serve } from "inngest/next";
import { inngest } from "../../inngest/client";
import {
  simpleGreeter,
  dataProcessor,
  emailSender,
  approvalWorkflow,
  apiFetcher,
  validationFunction,
  reminder,
  dailyReport,
  batchProcessor,
  limitedConcurrency,
  createUser,
} from "../../inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    simpleGreeter,
    dataProcessor,
    emailSender,
    approvalWorkflow,
    apiFetcher,
    validationFunction,
    reminder,
    dailyReport,
    batchProcessor,
    limitedConcurrency,
    createUser,
  ],
});
