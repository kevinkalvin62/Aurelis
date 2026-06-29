interface SetlistSourcePayload { version: 1; sourceText?: string; notes?: string }

export function encodeSetlistSource(sourceText?: string, notes?: string): string | null {
  if (!sourceText && !notes) return null;
  const payload: SetlistSourcePayload = { version: 1, ...(sourceText ? { sourceText } : {}), ...(notes ? { notes } : {}) };
  return JSON.stringify(payload);
}

export function decodeSetlistSource(value: unknown): { sourceText?: string; notes?: string } {
  if (typeof value !== 'string' || !value) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    if (parsed.version === 1) return { ...(typeof parsed.sourceText === 'string' ? { sourceText: parsed.sourceText } : {}), ...(typeof parsed.notes === 'string' ? { notes: parsed.notes } : {}) };
  } catch { /* Legacy source_text remains plain text. */ }
  return { sourceText: value };
}
