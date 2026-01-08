import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "AI Workflow Observer",
  description: "PDF ingestion + Q&A + observability dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/70 px-5 py-4 backdrop-blur">
            <div>
              <div className="text-sm font-semibold">AI Workflow Observer</div>
              <div className="text-xs text-[var(--muted)]">
                Local-first RAG + observability (Ollama/Chroma/FastAPI)
              </div>
            </div>
            <div className="text-xs text-[var(--muted)]">v0.2</div>
          </div>

          <div className="grid grid-cols-12 gap-5">
            <aside className="col-span-12 md:col-span-3">
              <Sidebar />
            </aside>

            <main className="col-span-12 md:col-span-9">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
