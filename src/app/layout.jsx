import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { AmplifyProvider } from "./AmplifyProvider";
import { clerkAppearance } from "@/config/clerk-appearance";

export const metadata = {
    title: "Agrotech",
    description: "Dashboard de sensores y clasificacion de cultivos por IA",
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body>
                <ClerkProvider
                    localization={esES}
                    appearance={clerkAppearance}
                    signInUrl="/sign-in"
                    signInFallbackRedirectUrl="/"
                    afterSignOutUrl="/sign-in"
                >
                    <AmplifyProvider>
                        {children}
                    </AmplifyProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
