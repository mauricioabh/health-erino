import { Inngest, EventSchemas } from "inngest";

type Events = {
  "health/sync.sheets": { data: { blobUrl?: string } };
};

export const inngest = new Inngest({
  id: "health-erino",
  schemas: new EventSchemas().fromRecord<Events>(),
});
