import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/design';

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  return <View style={styles.row}><Text style={styles.title}>{title}</Text>{action ? <Text style={styles.action}>{action}</Text> : null}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 8 },
  title: { color: colors.text, fontSize: 17, fontWeight: '700' },
  action: { color: colors.accent, fontSize: 13, fontWeight: '700' },
});
