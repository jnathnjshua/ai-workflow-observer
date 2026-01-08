"use client";

import { useEffect, useState } from "react";
import { uploadPdf } from "@/lib/api";
import { getUploadState, setUploadState, UploadItem } from "@/lib/uploadStore";

export default function UploadPage() {
  const initial = getUploadState();
  const [files, setFiles] = useState<UploadItem[]>(initial.files);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(initial.result);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUploadState({ files, result });
  }, [files, result]);

  async function onUpload() {
    if (!files.length) return;
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      let totalFiles = 0;
      let totalChunks = 0;
      const fileResults: any[] = [];
      for (const item of files) {
        if (item.status === "done") continue;
        setActiveUploadId(item.id);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: "uploading", error: undefined, progress: 0 } : f
          )
        );
        try {
          const res: any = await uploadPdf(item.file, (pct) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === item.id ? { ...f, progress: pct } : f))
            );
          });
          fileResults.push(res);
          if (typeof res?.files_ingested === "number") {
            totalFiles += res.files_ingested;
          } else {
            totalFiles += 1;
          }
          if (typeof res?.total_chunks === "number") {
            totalChunks += res.total_chunks;
          }
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id ? { ...f, status: "done", progress: 100 } : f
            )
          );
        } catch (e: any) {
          const message = e?.message || String(e);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id ? { ...f, status: "error", error: message } : f
            )
          );
        }
      }
      if (fileResults.length) {
        setResult({
          ok: true,
          files_ingested: totalFiles,
          total_chunks: totalChunks,
          results: fileResults,
        });
      }
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
      setActiveUploadId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="mb-4">
        <div className="text-lg font-semibold">Upload a financial PDF</div>
        <div className="text-sm text-[var(--muted)]">
          Upload a 10-Q / earnings report. The backend extracts text, chunks, embeds (Ollama), and stores in Chroma.
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center rounded-xl border border-[var(--border)] bg-black/5 px-4 py-2 text-sm text-[var(--muted)] hover:bg-black/10">
            Choose files
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => {
                const next = Array.from(e.target.files || []);
                const invalid = next.filter((f) => f.type !== "application/pdf");
                if (invalid.length) {
                  setErr("Unsupported file type. Please upload PDFs only.");
                } else {
                  setErr(null);
                }

                const valid = next.filter((f) => f.type === "application/pdf");
                setFiles((prev) => {
                  const existing = new Set(prev.map((f) => f.id));
                  const additions = valid
                    .map((f) => ({
                      id: `${f.name}-${f.size}-${f.lastModified}`,
                      file: f,
                      status: "idle" as const,
                      progress: 0,
                    }))
                    .filter((f) => !existing.has(f.id));
                  return prev.concat(additions);
                });
                e.currentTarget.value = "";
              }}
              className="sr-only"
            />
          </label>
          {files.length ? (
            <span className="text-sm text-[var(--muted)]">{files.length} files selected</span>
          ) : null}
        </div>

        <button
          onClick={onUpload}
          disabled={!files.length || loading}
          className="w-fit rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload & Ingest"}
        </button>

        {err && (
          <pre className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 whitespace-pre-wrap">
            {err}
          </pre>
        )}

        {files.length ? (
          <div className="rounded-xl border border-[var(--border)] bg-white p-4">
            <div className="mb-2 text-sm font-semibold">Uploads</div>
            <ul className="space-y-2">
              {files.map((f) => (
                <li key={f.id} className="flex items-center gap-3 text-sm">
                  <span
                    className={`upload-status ${
                      f.status === "done"
                        ? "upload-status--done"
                        : f.status === "error"
                        ? "upload-status--error"
                        : f.status === "uploading"
                        ? "upload-status--uploading"
                        : "upload-status--pending"
                    }`}
                    aria-hidden="true"
                    style={{ "--progress": `${f.progress}%` } as React.CSSProperties}
                  >
                    {f.status === "error" ? "!" : ""}
                  </span>
                  <span className="flex-1 text-[var(--muted)]">{f.file.name}</span>
                  <span className="text-xs text-[var(--muted)]">
                    {f.status === "uploading" || (loading && f.id === activeUploadId) ? (
                      <span className="upload-dots" aria-label="Uploading">
                        <span className="upload-dots__label">Uploading</span>
                        <span className="upload-dots__dot" />
                        <span className="upload-dots__dot" />
                        <span className="upload-dots__dot" />
                        <span className="upload-dots__dot" />
                      </span>
                    ) : f.status === "done" ? (
                      "Uploaded"
                    ) : f.status === "error" ? (
                      "Failed"
                    ) : (
                      "Pending"
                    )}
                  </span>
                  {f.status === "idle" ? (
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((p) => p.id !== f.id))}
                      className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/10 text-xs text-[var(--muted)] hover:bg-black/5"
                      aria-label={`Remove ${f.file.name}`}
                    >
                      ×
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {result && (
          <div className="rounded-xl border border-[var(--border)] bg-white p-4">
            <div className="mb-2 text-sm font-semibold">Ingestion Result</div>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
