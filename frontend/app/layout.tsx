import "./globals.css";
import Sidebar from "@/components/Sidebar";
import HeaderBar from "@/components/HeaderBar";

export const metadata = {
  title: "AI Workflow Observer",
  description: "PDF ingestion + Q&A + observability dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <HeaderBar />

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
