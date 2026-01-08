"use client";

import { useEffect, useMemo, useState } from "react";
import { getApiBaseUrl, getDefaultApiBase, resetApiBaseUrl, setApiBaseUrl } from "@/lib/apiBase";

type StatusState = "checking" | "connected" | "disconnected";

export default function HeaderBar() {
  const [apiBase, setApiBase] = useState(getApiBaseUrl());
  const [draft, setDraft] = useState(apiBase);
  const [status, setStatus] = useState<StatusState>("checking");
  const defaultBase = useMemo(() => getDefaultApiBase(), []);

  useEffect(() => {
    setDraft(apiBase);
  }, [apiBase]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    async function checkHealth() {
      setStatus("checking");
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch(`${apiBase}/health`, { signal: controller.signal });
        if (!isActive) return;
        setStatus(res.ok ? "connected" : "disconnected");
      } catch {
        if (!isActive) return;
        setStatus("disconnected");
      } finally {
        clearTimeout(timeout);
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => {
      isActive = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [apiBase]);

  function onSave() {
    const next = draft.trim() || defaultBase;
    setApiBaseUrl(next);
    setApiBase(next);
  }

  function onReset() {
    resetApiBaseUrl();
    setApiBase(defaultBase);
    setDraft(defaultBase);
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-white/70 px-5 py-4 backdrop-blur">
      <div>
        <div className="text-sm font-semibold">AI Workflow Observer</div>
        <div className="text-xs text-[var(--muted)]">
          Local-first RAG + observability (Ollama/Chroma/FastAPI)
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="text-xs text-[var(--muted)]">v0.2</div>
        <div className="text-xs text-[var(--muted)]">API base</div>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-56 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs"
          placeholder={defaultBase}
        />
        <button
          onClick={onSave}
          className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs hover:bg-black/5"
        >
          Save
        </button>
        <button
          onClick={onReset}
          className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] hover:bg-black/5"
        >
          Reset
        </button>
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            status === "connected"
              ? "bg-black text-white"
              : status === "checking"
              ? "bg-black/10 text-black"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {status === "connected" ? "Connected" : status === "checking" ? "Checking" : "Not connected"}
        </span>
      </div>
    </div>
  );
}
