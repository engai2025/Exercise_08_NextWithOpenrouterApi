"use client";

import { useMemo, useState } from "react";
import { workflows, type Workflow } from "@/app/lib/workflows";

type Activity = {
  id: string;
  at: string;
  title: string;
  status: "ok" | "error" | "warning";
  detail: string;
};

function emptyValues(workflow: Workflow) {
  return Object.fromEntries(workflow.fields.map((field) => [field.key, ""]));
}

async function readJson(res: Response) {
  const text = await res.text();
  if (!text) {
    return { error: `Empty response (HTTP ${res.status})` };
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: text.slice(0, 180) };
  }
}

export function Dashboard() {
  const [selectedId, setSelectedId] = useState(workflows[0].id);
  const [values, setValues] = useState<Record<string, string>>({
    ...emptyValues(workflows[0]),
    ...workflows[0].sample,
  });
  const [busy, setBusy] = useState(false);
  const [activity, setActivity] = useState<Activity[]>([]);

  const selected = useMemo(
    () => workflows.find((workflow) => workflow.id === selectedId) ?? workflows[0],
    [selectedId]
  );

  function onSelectJob(id: string) {
    const workflow = workflows.find((item) => item.id === id) ?? workflows[0];
    setSelectedId(workflow.id);
    setValues({ ...emptyValues(workflow), ...workflow.sample });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = selected.toData(values);
    const endpoint = selected.endpoint ?? "/api/events";
    const body =
      endpoint === "/api/user"
        ? payload
        : { name: selected.event, data: payload };

    setBusy(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await readJson(res);
      const warning = typeof json.warning === "string" ? json.warning : "";
      const error = typeof json.error === "string" ? json.error : "";
      const ok = res.ok && !error;

      setActivity((current) =>
        [
          {
            id: crypto.randomUUID(),
            at: new Date().toLocaleTimeString(),
            title: selected.title,
            status: warning ? "warning" : ok ? "ok" : "error",
            detail: warning || error || "Job queued",
          },
          ...current,
        ].slice(0, 8)
      );
    } catch (error) {
      setActivity((current) =>
        [
          {
            id: crypto.randomUUID(),
            at: new Date().toLocaleTimeString(),
            title: selected.title,
            status: "error" as const,
            detail: error instanceof Error ? error.message : "Request failed",
          },
          ...current,
        ].slice(0, 8)
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Workflows</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Fill the form and run a background job.
      </p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-1.5">
          <span className="text-sm text-neutral-600">Job</span>
          <select
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-800"
            value={selected.id}
            onChange={(e) => onSelectJob(e.target.value)}
          >
            {workflows.map((workflow) => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.title}
              </option>
            ))}
          </select>
        </label>

        {selected.fields.map((field) => (
          <label key={field.key} className="block space-y-1.5">
            <span className="text-sm text-neutral-600">{field.label}</span>
            {field.type === "textarea" ? (
              <textarea
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-800"
                rows={3}
                required={field.required}
                placeholder={field.placeholder}
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((current) => ({
                    ...current,
                    [field.key]: e.target.value,
                  }))
                }
              />
            ) : (
              <input
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-800"
                type={field.type ?? "text"}
                required={field.required}
                placeholder={field.placeholder}
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((current) => ({
                    ...current,
                    [field.key]: e.target.value,
                  }))
                }
              />
            )}
          </label>
        ))}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-neutral-900 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "Running…" : "Run"}
        </button>
      </form>

      {activity.length > 0 ? (
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-700">Activity</h2>
            <button
              type="button"
              className="text-sm text-neutral-500"
              onClick={() => setActivity([])}
            >
              Clear
            </button>
          </div>
          <ul className="space-y-3">
            {activity.map((item) => (
              <li key={item.id} className="text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{item.title}</span>
                  <time className="text-xs text-neutral-400">{item.at}</time>
                </div>
                <p
                  className={
                    item.status === "ok"
                      ? "mt-0.5 text-green-700"
                      : item.status === "warning"
                        ? "mt-0.5 text-amber-700"
                        : "mt-0.5 text-red-700"
                  }
                >
                  {item.detail}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
