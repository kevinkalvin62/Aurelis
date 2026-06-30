import { describe, expect, it } from 'vitest';
import { dateToISO, formatFriendlyDate, isISODate, isoToDate } from './dates';

describe('date helpers', () => {
  it('accepts only real ISO calendar dates', () => {
    expect(isISODate('2026-07-04')).toBe(true);
    expect(isISODate("04/'7/2026")).toBe(false);
    expect(isISODate('2026-02-30')).toBe(false);
  });

  it('round-trips without shifting the local calendar day', () => {
    expect(dateToISO(isoToDate('2026-07-04'))).toBe('2026-07-04');
  });

  it('uses a friendly display label', () => {
    expect(formatFriendlyDate('2026-07-04')).not.toBe('2026-07-04');
    expect(formatFriendlyDate()).toBe('Sin fecha');
  });
});
