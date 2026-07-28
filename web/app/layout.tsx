import { ClerkProvider } from "@clerk/nextjs";
import { SerwistProvider } from "@serwist/next/react";
import { rootLayoutMetadata } from "@/lib/seo/metadata";
import "./globals.css";

export const metadata = rootLayoutMetadata();

function hasValidClerkPublishableKey(key: string | undefined): key is string {
  if (!key) return false;
  if (!key.startsWith("pk_")) return false;
  return !key.includes("placeholder");
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const appShell = (
    <html lang="es">
      <body>
        <SerwistProvider
          swUrl="/sw.js"
          disable={process.env.NODE_ENV === "development"}
        >
          {children}
        </SerwistProvider>
      </body>
    </html>
  );

  if (!hasValidClerkPublishableKey(clerkPublishableKey)) {
    return appShell;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      {appShell}
    </ClerkProvider>
  );
}
