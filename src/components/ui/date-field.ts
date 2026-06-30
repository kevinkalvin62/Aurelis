import { DateField as NativeDateField } from './date-field.native';
import { DateField as WebDateField } from './date-field.web';

export const DateField = process.env.EXPO_OS === 'web' ? WebDateField : NativeDateField;
