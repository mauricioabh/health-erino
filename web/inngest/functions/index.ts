import { inngest } from "@/inngest/client";
import { runSheetsToNeonSync } from "@/lib/sync/sheets-to-neon";

/** Cron: Google Sheets CSV (or Blob URL from app_settings) → Neon medicamentos. */
export const syncSheetsCron = inngest.createFunction(
  { id: "sync-sheets-cron", name: "Sheets → Neon sync" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const result = await step.run("sync", () => runSheetsToNeonSync());
    if (!result.ok) {
      // Missing CSV URL or fetch errors — do not retry forever when creds unset.
      return { skipped: true, reason: result.error, status: result.status };
    }
    return result;
  },
);

/** Manual/on-demand sync via Inngest event (optional trigger from admin). */
export const syncSheetsManual = inngest.createFunction(
  { id: "sync-sheets-manual", name: "Sheets → Neon sync (manual)" },
  { event: "health/sync.sheets" },
  async ({ event, step }) => {
    const result = await step.run("sync", () =>
      runSheetsToNeonSync({ blobUrl: event.data.blobUrl }),
    );
    if (!result.ok) {
      return { ok: false, error: result.error, status: result.status };
    }
    return result;
  },
);

export const functions = [syncSheetsCron, syncSheetsManual];
