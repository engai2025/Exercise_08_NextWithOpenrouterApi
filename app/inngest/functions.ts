import { inngest } from "./client";
import { NonRetriableError } from "inngest";

export const simpleGreeter = inngest.createFunction(
  {
    id: "simple-greeter",
    triggers: [{ event: "greet/user" }],
  },
  async ({ event, step }) => {
    const result = await step.run("say-hello", async () => {
      const { name } = event.data;

      console.log(`Hello, ${name}!`);

      return {
        message: `Hello, ${name}!`,
        timestamp: new Date().toISOString(),
      };
    });

    return result;
  }
);

export const dataProcessor = inngest.createFunction(
  {
    id: "data-processor",
    triggers: [{ event: "data/process" }],
  },
  async ({ event, step }) => {
    const rawData = await step.run("fetch-data", async () => {
      console.log("Fetching data...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { users: ["Alice", "Bob", "Charlie"] };
    });

    const transformedData = await step.run("transform-data", async () => {
      console.log("Transforming data...");
      return rawData.users.map((user: string) => ({
        name: user,
        email: `${user.toLowerCase()}@example.com`,
      }));
    });

    const result = await step.run("save-data", async () => {
      console.log("Saving data...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { saved: transformedData.length, data: transformedData };
    });

    return result;
  }
);

export const emailSender = inngest.createFunction(
  {
    id: "email-sender",
    triggers: [{ event: "email/send" }],
  },
  async ({ event, step }) => {
    const raw = event.data?.emails ?? event.data?.email;
    const emails: string[] = Array.isArray(raw) ? raw : raw ? [raw] : [];

    if (emails.length === 0) {
      throw new Error(
        'Missing emails in event data. Send { "emails": ["a@example.com", "b@example.com"] }'
      );
    }

    const results = [];

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];

      const result = await step.run(`send-email-${i}`, async () => {
        console.log(`Sending email to ${email}...`);
        await new Promise((resolve) => setTimeout(resolve, 200));
        return { email, status: "sent", timestamp: new Date().toISOString() };
      });

      results.push(result);

      if (i < emails.length - 1) {
        await step.sleep(`rate-limit-delay-${i}`, "2s");
      }
    }

    return { sent: results.length, results };
  }
);

export const approvalWorkflow = inngest.createFunction(
  {
    id: "approval-workflow",
    triggers: [{ event: "workflow/start" }],
  },
  async ({ event, step }) => {
    const { requestId, action } = event.data;

    const processed = await step.run("process-request", async () => {
      console.log(`Processing request: ${action}`);
      return { requestId, action, status: "pending_approval" };
    });

    const approval = await step.waitForEvent("wait-for-approval", {
      event: "workflow/approval",
      timeout: "1h",
      match: "data.requestId",
    });

    if (!approval) {
      return {
        requestId,
        status: "timeout",
        message: "Approval not received within 1 hour",
      };
    }

    const result = await step.run("execute-action", async () => {
      if (approval.data.approved) {
        console.log(`Executing approved action: ${action}`);
        return { requestId, status: "completed", action };
      } else {
        return { requestId, status: "rejected", reason: approval.data.reason };
      }
    });

    return result;
  }
);

export const apiFetcher = inngest.createFunction(
  {
    id: "api-fetcher",
    triggers: [{ event: "api/fetch" }],
  },
  async ({ event, step }) => {
    const { url } = event.data;

    const data = await step.run("fetch-api", async () => {
      console.log(`Fetching from ${url}...`);

      if (Math.random() > 0.3) {
        throw new Error("API temporarily unavailable");
      }

      return { url, data: "Success!" };
    });

    return data;
  }
);

export const validationFunction = inngest.createFunction(
  {
    id: "validation",
    triggers: [{ event: "data/validate" }],
  },
  async ({ event, step }) => {
    const { email } = event.data;

    const isValid = await step.run("validate-email", async () => {
      if (!email.includes("@")) {
        throw new NonRetriableError("Invalid email format");
      }
      return { email, valid: true };
    });

    return isValid;
  }
);

export const reminder = inngest.createFunction(
  {
    id: "reminder",
    triggers: [{ event: "reminder/schedule" }],
  },
  async ({ event, step }) => {
    const { message, delayMinutes } = event.data;

    await step.sleep("wait-for-reminder", `${delayMinutes}m`);

    const sent = await step.run("send-reminder", async () => {
      console.log(`🔔 Reminder: ${message}`);
      return {
        message,
        sentAt: new Date().toISOString(),
        originalDelay: delayMinutes,
      };
    });

    return sent;
  }
);

export const dailyReport = inngest.createFunction(
  {
    id: "daily-report",
    triggers: [{ cron: "*/1 * * * *" }],
  },
  async ({ step }) => {
    const report = await step.run("generate-report", async () => {
      const timestamp = new Date().toISOString();
      console.log(`📊 Generating daily report at ${timestamp}`);

      return {
        date: new Date().toDateString(),
        metrics: {
          users: Math.floor(Math.random() * 1000),
          revenue: Math.floor(Math.random() * 10000),
        },
        generatedAt: timestamp,
      };
    });

    return report;
  }
);

export const batchProcessor = inngest.createFunction(
  {
    id: "batch-processor",
    triggers: [{ event: "batch/process" }],
  },
  async ({ event, step }) => {
    const { items } = event.data;

    console.log(`Processing ${items.length} items...`);

    const results = await Promise.all(
      items.map((item: string, index: number) =>
        step.run(`process-item-${index}`, async () => {
          console.log(`Processing item: ${item}`);
          await new Promise((resolve) => setTimeout(resolve, 500));
          return { item, processed: true, timestamp: new Date().toISOString() };
        })
      )
    );

    return { processed: results.length, results };
  }
);

export const limitedConcurrency = inngest.createFunction(
  {
    id: "limited-concurrency",
    concurrency: {
      limit: 2,
    },
    triggers: [{ event: "task/process" }],
  },
  async () => {}
);

export const createUser = inngest.createFunction(
  {
    id: "create-user",
    triggers: [{ event: "user/create" }, { event: "user/registered" }],
  },
  async ({ event, step }) => {
    const { email, name } = event.data;

    const user = await step.run("sending email to user", async () => {
      console.log(`sending welcome email to": ${name} <${email}>`);
      return {
        id: `user-${Date.now()}`,
        email,
        name,
        createdAt: new Date().toISOString(),
      };
    });

    return user;
  }
);
