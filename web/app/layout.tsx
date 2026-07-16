import { ClerkProvider } from "@clerk/nextjs";
import { SerwistProvider } from "@serwist/next/react";
import { rootLayoutMetadata } from "@/lib/seo/metadata";
import "./globals.css";

export const metadata = rootLayoutMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
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
    </ClerkProvider>
  );
}
