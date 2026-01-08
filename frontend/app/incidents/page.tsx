"use client";

import { useEffect, useState } from "react";
import { getIncidents } from "@/lib/api";

function badgeClass(sev: string) {
  const s = (sev || "").toLowerCase();
  if (s === "critical") return "bg-black text-white";
  if (s === "error") return "bg-black/10 text-black";
  return "bg-black/5 text-black";
}

export default function IncidentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await getIncidents(50);
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Incidents</div>
          <div className="text-sm text-[var(--muted)]">
            Operational events captured from the AI workflow (e.g., provider outages, pipeline failures).
          </div>
        </div>

        <button
          onClick={load}
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {err && (
        <pre className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 whitespace-pre-wrap">
          {err}
        </pre>
      )}

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] text-xs text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Component</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Message</th>
            </tr>
          </thead>

          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-[var(--border)] last:border-b-0">
                <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">
                  {it.created_at}
                </td>
                <td className="px-4 py-3">{it.component}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${badgeClass(it.severity)}`}>
                    {it.severity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{it.message}</div>
                  {it.error ? (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-xs text-[var(--muted)]">
                        Show error
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-black/[0.02] p-3 text-xs">
                        {it.error}
                      </pre>
                    </details>
                  ) : null}
                </td>
              </tr>
            ))}

            {!items.length && !loading && (
              <tr>
                <td className="px-4 py-6 text-sm text-[var(--muted)]" colSpan={4}>
                  No incidents yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
