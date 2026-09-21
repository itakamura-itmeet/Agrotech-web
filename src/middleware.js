import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)"]);

export default clerkMiddleware(
    async (auth, req) => {
        const { userId } = await auth();

        if (isPublicRoute(req)) {
            if (userId) {
                return NextResponse.redirect(new URL("/", req.url));
            }
            return;
        }

        await auth.protect();
    },
    { signInUrl: "/sign-in" },
);

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
