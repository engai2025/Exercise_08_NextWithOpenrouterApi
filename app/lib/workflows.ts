export type FieldType = "text" | "textarea" | "number" | "email" | "url";

export type WorkflowField = {
  key: string;
  label: string;
  placeholder?: string;
  type?: FieldType;
  required?: boolean;
  hint?: string;
};

export type Workflow = {
  id: string;
  title: string;
  description: string;
  event: string;
  category: "people" | "data" | "ops";
  endpoint?: "/api/events" | "/api/user";
  fields: WorkflowField[];
  sample: Record<string, string>;
  toData: (values: Record<string, string>) => Record<string, unknown>;
};

function splitList(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export const workflows: Workflow[] = [
  {
    id: "create-user",
    title: "Register user",
    description: "Create a user and send a welcome-email job.",
    event: "user/registered",
    category: "people",
    endpoint: "/api/user",
    fields: [
      { key: "name", label: "Name", placeholder: "Ada Lovelace", required: true },
      {
        key: "email",
        label: "Email",
        type: "email",
        placeholder: "ada@example.com",
        required: true,
      },
    ],
    sample: { name: "Ada Lovelace", email: "ada@example.com" },
    toData: (values) => ({ name: values.name, email: values.email }),
  },
  {
    id: "greet",
    title: "Greet user",
    description: "Run a one-step hello function and return a timestamp.",
    event: "greet/user",
    category: "people",
    fields: [
      { key: "name", label: "Name", placeholder: "Grace Hopper", required: true },
    ],
    sample: { name: "Grace Hopper" },
    toData: (values) => ({ name: values.name }),
  },
  {
    id: "email",
    title: "Send emails",
    description: "Queue emails one-by-one with a 2s rate-limit sleep.",
    event: "email/send",
    category: "people",
    fields: [
      {
        key: "emails",
        label: "Emails",
        type: "textarea",
        placeholder: "ada@example.com, grace@example.com",
        required: true,
        hint: "Comma or newline separated",
      },
    ],
    sample: { emails: "ada@example.com, grace@example.com" },
    toData: (values) => ({ emails: splitList(values.emails) }),
  },
  {
    id: "validate",
    title: "Validate email",
    description: "Check format. Invalid emails fail without retry.",
    event: "data/validate",
    category: "people",
    fields: [
      {
        key: "email",
        label: "Email",
        type: "email",
        placeholder: "not-an-email",
        required: true,
      },
    ],
    sample: { email: "ada@example.com" },
    toData: (values) => ({ email: values.email }),
  },
  {
    id: "process",
    title: "Process data",
    description: "Fetch, transform, then save a small demo dataset.",
    event: "data/process",
    category: "data",
    fields: [],
    sample: {},
    toData: () => ({}),
  },
  {
    id: "batch",
    title: "Batch process",
    description: "Fan out one step per item and wait for all to finish.",
    event: "batch/process",
    category: "data",
    fields: [
      {
        key: "items",
        label: "Items",
        type: "textarea",
        placeholder: "alpha, beta, gamma",
        required: true,
        hint: "Comma or newline separated",
      },
    ],
    sample: { items: "alpha, beta, gamma" },
    toData: (values) => ({ items: splitList(values.items) }),
  },
  {
    id: "fetch",
    title: "Fetch API",
    description: "Call an upstream URL. Failures retry automatically.",
    event: "api/fetch",
    category: "data",
    fields: [
      {
        key: "url",
        label: "URL",
        type: "url",
        placeholder: "https://api.example.com/health",
        required: true,
      },
    ],
    sample: { url: "https://api.example.com/health" },
    toData: (values) => ({ url: values.url }),
  },
  {
    id: "workflow-start",
    title: "Start approval",
    description: "Begin a request, then wait up to 1 hour for a decision.",
    event: "workflow/start",
    category: "ops",
    fields: [
      {
        key: "requestId",
        label: "Request ID",
        placeholder: "req-1001",
        required: true,
      },
      {
        key: "action",
        label: "Action",
        placeholder: "publish-article",
        required: true,
      },
    ],
    sample: { requestId: "req-1001", action: "publish-article" },
    toData: (values) => ({
      requestId: values.requestId,
      action: values.action,
    }),
  },
  {
    id: "workflow-approve",
    title: "Send approval",
    description: "Resume a waiting workflow with approve or reject.",
    event: "workflow/approval",
    category: "ops",
    fields: [
      {
        key: "requestId",
        label: "Request ID",
        placeholder: "req-1001",
        required: true,
      },
      {
        key: "approved",
        label: "Decision",
        placeholder: "true or false",
        required: true,
        hint: 'Use "true" to approve or "false" to reject',
      },
      {
        key: "reason",
        label: "Reason",
        placeholder: "Looks good",
      },
    ],
    sample: { requestId: "req-1001", approved: "true", reason: "Looks good" },
    toData: (values) => ({
      requestId: values.requestId,
      approved: values.approved.trim().toLowerCase() === "true",
      reason: values.reason,
    }),
  },
  {
    id: "reminder",
    title: "Schedule reminder",
    description: "Sleep for N minutes, then log a reminder message.",
    event: "reminder/schedule",
    category: "ops",
    fields: [
      {
        key: "message",
        label: "Message",
        placeholder: "Follow up with the design team",
        required: true,
      },
      {
        key: "delayMinutes",
        label: "Delay (minutes)",
        type: "number",
        placeholder: "1",
        required: true,
      },
    ],
    sample: { message: "Follow up with the design team", delayMinutes: "1" },
    toData: (values) => ({
      message: values.message,
      delayMinutes: Number(values.delayMinutes) || 1,
    }),
  },
  {
    id: "task",
    title: "Limited task",
    description: "Enqueue work with a concurrency cap of 2.",
    event: "task/process",
    category: "ops",
    fields: [
      {
        key: "label",
        label: "Task label",
        placeholder: "resize-images",
        required: true,
      },
    ],
    sample: { label: "resize-images" },
    toData: (values) => ({ label: values.label }),
  },
];

export const categories = [
  { id: "people", label: "People" },
  { id: "data", label: "Data" },
  { id: "ops", label: "Operations" },
] as const;
