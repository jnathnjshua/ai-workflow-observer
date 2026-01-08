const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function uploadPdf(file: File, onProgress?: (pct: number) => void) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/ingest_pdf`);

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
  const res = await fetch(`${API_BASE}/ask?${params.toString()}`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getIncidents(limit = 25) {
  const res = await fetch(`${API_BASE}/incidents?limit=${limit}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
