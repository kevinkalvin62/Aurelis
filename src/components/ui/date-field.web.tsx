import type { CSSProperties, FormEvent } from 'react';
import { colors, radii } from '@/constants/design';

interface DateFieldProps {
  value?: string;
  onChange: (value: string) => void;
}

const style: CSSProperties = {
  width: '100%',
  minHeight: 50,
  color: colors.text,
  colorScheme: 'dark',
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: radii.md,
  padding: '0 14px',
  fontSize: 13,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

export function DateField({ value, onChange }: DateFieldProps) {
  return <input aria-label="Seleccionar fecha" type="date" value={value ?? ''} onInput={(event: FormEvent<HTMLInputElement>) => onChange(event.currentTarget.value)} style={style} />;
}
