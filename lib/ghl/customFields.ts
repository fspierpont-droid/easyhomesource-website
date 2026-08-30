export type GhlCustomFieldLike = {
  id?: unknown;
  fieldValue?: unknown;
  fieldValueString?: unknown;
  fieldValueNumber?: unknown;
  field_value?: unknown;
};

/**
 * Read an opportunity/contact custom field across the current HighLevel v3
 * response shape and the legacy shapes that older EHS records may still use.
 *
 * HighLevel v3 returns `fieldValue`; the legacy fallbacks are intentionally
 * retained so historical/test payloads continue to reconcile safely.
 */
export function readGhlCustomValue(fields: unknown, id: string): unknown {
  if (!id || !Array.isArray(fields)) return undefined;

  const field = fields.find((item): item is GhlCustomFieldLike => {
    if (!item || typeof item !== 'object') return false;
    return String((item as GhlCustomFieldLike).id || '') === id;
  });

  if (!field) return undefined;

  return field.fieldValue
    ?? field.fieldValueString
    ?? field.fieldValueNumber
    ?? field.field_value;
}
