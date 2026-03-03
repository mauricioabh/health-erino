import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Health-erino - Gestión de medicamentos",
  description: "Asistente de medicamentos con voz e IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider locale="es">
      <html lang="es">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
