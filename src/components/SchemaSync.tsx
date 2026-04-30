import { useSchemaSync } from "@/hooks/useSchemaSync";

/**
 * Invisible component that runs schema sync on app load
 * Place inside provider tree to ensure hooks work properly
 */
export function SchemaSync() {
  useSchemaSync();
  return null;
}
