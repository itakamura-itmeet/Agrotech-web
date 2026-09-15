import "./globals.css";
import { AmplifyProvider } from "./AmplifyProvider";

export const metadata = {
    title: "Agrotech",
    description: "Dashboard de sensores y clasificacion de cultivos por IA",
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body>
                <AmplifyProvider>
                    {children}
                </AmplifyProvider>
            </body>
        </html>
    );
}
