import { getApiBaseUrl } from "./apiBase";

export async function uploadPdf(file: File, onProgress?: (pct: number) => void) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);

    const xhr = new XMLHttpRequest();
    const base = getApiBaseUrl();
    xhr.open("POST", `${base}/ingest_pdf`);

    xhr.upload.onprogress = (event) => {
      if (!onProgress) return;
      const total = event.lengthComputable ? event.total : file.size;
      if (!total) return;
      let pct = Math.round((event.loaded / total) * 100);
      if (pct >= 100 && xhr.readyState !== 4) {
        pct = 99;
      }
      onProgress(pct);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          resolve(xhr.responseText);
        }
        return;
      }
      reject(new Error(xhr.responseText || "Upload failed"));
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));

    xhr.send(fd);
  });
}

export async function ask(question: string, top_k = 8) {
  const params = new URLSearchParams({ question, top_k: String(top_k) });
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/ask?${params.toString()}`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getIncidents(limit = 25) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/incidents?limit=${limit}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getHealth() {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/health`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
