"use client";

import { Download } from "lucide-react";

const CSV_HEADERS = "nombre,descripcion,fecha_caducidad,stock";
const CSV_EXAMPLE = "Paracetamol 500mg,Analgésico y antipirético,2025-12-31,20";

export function DownloadTemplateButton() {
  function handleDownload() {
    const content = [CSV_HEADERS, CSV_EXAMPLE].join("\n");
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla-medicamentos.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      title="Descarga un CSV con las cabeceras: nombre, descripcion, fecha_caducidad, stock. El nombre del archivo puede ser cualquiera."
      className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-500 transition-colors"
    >
      <Download className="h-3.5 w-3.5 shrink-0" />
      Descargar plantilla
    </button>
  );
}
