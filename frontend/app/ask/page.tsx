"use client";

import { useEffect, useRef, useState } from "react";
import { ask } from "@/lib/api";

function clip(text: string, n = 260) {
  const s = (text || "").replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n) + "..." : s;
}

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState(8);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<
    { id: string; question: string; topK: number; result: any; createdAt: number }[]
  >([]);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("askHistory");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      } catch {
        setHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("askHistory", JSON.stringify(history));
  }, [history]);

  async function onAsk() {
    if (!question.trim()) return;
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const data = await ask(question, topK);
      setResult(data);
      const entry = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        question: question.trim(),
        topK,
        result: data,
        createdAt: Date.now(),
      };
      setHistory((prev) => [entry, ...prev]);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  function selectHistory(item: any) {
    setQuestion(item.question);
    setTopK(item.topK);
    setResult(item.result);
  }

  function removeHistory(id: string) {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }

  function clearHistory() {
    setHistory([]);
    setResult(null);
  }

  function beginHold() {
    if (!history.length) return;
    setHoldProgress(0);
    const start = Date.now();
    holdIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const next = Math.min(100, (elapsed / 5000) * 100);
      setHoldProgress(next);
    }, 100);
    holdTimerRef.current = window.setTimeout(() => {
      clearHistory();
      endHold();
    }, 5000);
  }

  function endHold() {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHoldProgress(0);
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Question history</div>
            <button
              type="button"
              onMouseDown={beginHold}
              onMouseUp={endHold}
              onMouseLeave={endHold}
              onTouchStart={beginHold}
              onTouchEnd={endHold}
              className="relative overflow-hidden rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700"
              disabled={!history.length}
              aria-label="Clear all questions"
            >
              <span className="relative z-10">
                {holdProgress > 0 && holdProgress < 100 ? "Keep holding..." : "Clear all"}
              </span>
              {holdProgress > 0 ? (
                <span
                  className="absolute inset-0 bg-red-200/70"
                  style={{ width: `${holdProgress}%` }}
                />
              ) : null}
            </button>
          </div>

          <div className="space-y-2">
            {!history.length ? (
              <div className="text-sm text-[var(--muted)]">No questions yet.</div>
            ) : null}
            {history.map((h) => (
              <div
                key={h.id}
                className="group flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
              >
                <button
                  type="button"
                  onClick={() => selectHistory(h)}
                  className="flex-1 text-left text-[var(--text)] hover:underline"
                >
                  {h.question}
                </button>
                <button
                  type="button"
                  onClick={() => removeHistory(h.id)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-black/10 text-xs text-[var(--muted)] opacity-70 hover:bg-black/5 hover:opacity-100"
                  aria-label={`Remove ${h.question}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5 lg:col-span-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
        <div className="mb-4">
          <div className="text-lg font-semibold">Ask a question</div>
          <div className="text-sm text-[var(--muted)]">
            Retrieval → LLM answer (Ollama) → traceable citations + exact sections.
          </div>
        </div>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., What risks could impact near-term revenue?"
          className="min-h-[90px] w-full rounded-xl border border-[var(--border)] bg-white p-3 text-sm outline-none"
        />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="text-sm text-[var(--muted)]">Top K</label>
          <input
            type="number"
            min={1}
            max={20}
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="w-20 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
          />

          <button
            onClick={onAsk}
            disabled={loading}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-50"
          >
            {loading ? "Asking..." : "Ask"}
          </button>

          {(question.trim().length > 0 || result) && (
            <button
              type="button"
              onClick={() => setQuestion("")}
              className="ml-auto rounded-xl border border-red-200 bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
            >
              Clear
            </button>
          )}
        </div>

        {err && (
          <pre className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 whitespace-pre-wrap">
            {err}
          </pre>
        )}
        </div>

        {result && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Answer</div>
          <pre className="whitespace-pre-wrap text-sm leading-6">{result.answer}</pre>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] bg-white p-4">
              <div className="mb-2 text-sm font-semibold">Citations</div>
              <div className="space-y-2">
                {(result.citations || []).map((c: any, idx: number) => (
                  <div key={idx} className="rounded-lg border border-[var(--border)] p-3">
                    <div className="text-xs text-[var(--muted)]">{c.ref}</div>
                    <div className="text-sm">{c.note}</div>
                  </div>
                ))}
                {(!result.citations || result.citations.length === 0) && (
                  <div className="text-sm text-[var(--muted)]">No citations returned.</div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-white p-4">
              <div className="mb-2 text-sm font-semibold">Exact sections</div>
              <div className="space-y-2">
                {(result.sources || []).map((s: any, idx: number) => (
                  <div key={s.id || idx} className="rounded-lg border border-[var(--border)] p-3">
                    <div className="text-xs text-[var(--muted)]">
                      {s.metadata?.source_file} • chunk {s.metadata?.chunk_index}
                    </div>
                    <div className="text-sm">{clip(s.content)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-[var(--muted)]">
              Show raw JSON
            </summary>
            <pre className="mt-2 text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </details>
          </div>
        )}
      </div>
    </div>
  );
}
