import { ClerkProvider } from "@clerk/nextjs";
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
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
