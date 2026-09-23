import AgrotechContainer from "@/components/agrotech/AgrotechContainer";
import Link from "next/link";
import Logo from '@/assets/logo/LogoHeader';
import AccountMenu from "@/components/auth/AccountMenu";

function App() {

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto p-10 lg:p-12 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            {/* Text logo */}
            <span className="text-xl font-bold mr-2 text-black">ITMEET</span>
            {/* Icon logo - Replace with your custom logo */}
            <div className="w-8 h-8 relative">
              <Logo />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>🌱</span>
            AgroTech IoT Dashboard
          </h1>
          <AccountMenu />
        </div>
      </header>
      <main className="p-10">
        <AgrotechContainer deviceId="agrotech-iot-dev-sensor-001" />
      </main>
    </div>
  );
}

export default App;
