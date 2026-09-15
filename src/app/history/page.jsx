import HistoryList from "@/components/agrotech/HistoryList";
import Link from "next/link";

export default function AgrotechHistoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto p-10 lg:p-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              ← Volver al Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              📋 Historial de Análisis
            </h1>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-10 lg:p-12">
        <HistoryList />
      </main>
    </div>
  );
}
