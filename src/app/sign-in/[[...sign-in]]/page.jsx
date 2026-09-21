import { SignIn } from "@clerk/nextjs";
import Logo from "@/assets/logo/LogoHeader";

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center gap-6">
            <Logo />
            <SignIn path="/sign-in" routing="path" />
        </div>
    );
}
