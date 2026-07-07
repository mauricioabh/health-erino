import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/seo/site";

export function rootLayoutMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: "Health-erino - Gestión de medicamentos",
    description: "Asistente de medicamentos con voz e IA",
    robots: { index: false, follow: false },
  };
}
