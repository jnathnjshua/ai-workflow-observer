"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";

function pill(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "ok") return "bg-black text-white";
  if (s === "degraded") return "bg-black/10 text-black";
  return "bg-red-50 text-red-800 border border-red-200";
}

function Card({ title, children }: any) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-semibold">{title}</div>
      {children}
    </div>
  );
}

export default function HealthPage() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const d = await getHealth();
      setData(d);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const overall = data?.status || "unknown";
  const checks = data?.checks || {};

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Health</div>
          <div className="text-sm text-[var(--muted)]">
            Live subsystem status for DB, vector store, and LLM provider.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs ${pill(overall)}`}>
            {overall}
          </span>

          <button
            onClick={load}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {err && (
        <pre className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 whitespace-pre-wrap">
          {err}
        </pre>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Database">
          <div className="text-sm">
            <span className="text-[var(--muted)]">status: </span>
            <span className="font-medium">{checks.db?.status || "unknown"}</span>
          </div>
        </Card>

        <Card title="Chroma">
          <div className="text-sm">
            <span className="text-[var(--muted)]">status: </span>
            <span className="font-medium">{checks.chroma?.status || "unknown"}</span>
          </div>
          {typeof checks.chroma?.doc_count !== "undefined" && (
            <div className="mt-1 text-xs text-[var(--muted)]">
              doc_count: {checks.chroma?.doc_count}
            </div>
          )}
          {checks.chroma?.error && (
            <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-black/[0.02] p-3 text-xs">
              {checks.chroma?.error}
            </pre>
          )}
        </Card>

        <Card title="Ollama">
          <div className="text-sm">
            <span className="text-[var(--muted)]">status: </span>
            <span className="font-medium">{checks.ollama?.status || "unknown"}</span>
          </div>
          {checks.ollama?.models?.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {checks.ollama.models.slice(0, 8).map((m: string) => (
                <span
                  key={m}
                  className="rounded-full border border-[var(--border)] bg-black/5 px-2 py-1 text-xs"
                >
                  {m}
                </span>
              ))}
            </div>
          ) : null}
          {checks.ollama?.error && (
            <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-black/[0.02] p-3 text-xs">
              {checks.ollama?.error}
            </pre>
          )}
        </Card>
      </div>

      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-[var(--muted)]">Show raw JSON</summary>
        <pre className="mt-2 text-xs whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
      </details>
    </div>
  );
}
