import ClassificationDetail from "@/components/agrotech/ClassificationDetail";
import Link from "next/link";
import AccountMenu from "@/components/auth/AccountMenu";

export default function AgrotechDetailPage({ params }) {
  // params.id is available in Server Components

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto p-10 lg:p-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <Link href="/history" className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-1">
                ← Volver al Historial
              </Link>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Detalle de Análisis
              </h1>
            </div>
          </div>
          <AccountMenu />
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-10 lg:p-12">
        <ClassificationDetail imageId={params.id} />
      </main>
    </div>
  );
}
