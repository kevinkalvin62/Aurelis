import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/constants/design';
import type { Song } from '@/types/domain';

export function SongRow({ song, index }: { song: Song; index?: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${song.title}`}
      onPress={() => router.push({ pathname: '/song/[id]', params: { id: song.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.indexBox}><Text style={styles.index}>{index ? String(index).padStart(2, '0') : '♪'}</Text></View>
      <View style={styles.main}>
        <Text numberOfLines={1} style={styles.title}>{song.title}</Text>
        <Text numberOfLines={1} style={styles.meta}>{song.artist} · {song.bpm} BPM</Text>
      </View>
      <View style={styles.key}><Text style={styles.keyText}>{song.key}</Text></View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  pressed: { opacity: 0.6 },
  indexBox: { width: 30, height: 30, borderRadius: radii.sm, backgroundColor: colors.white08, alignItems: 'center', justifyContent: 'center' },
  index: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  main: { flex: 1 },
  title: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 5 },
  meta: { color: colors.textSecondary, fontSize: 12 },
  key: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 5 },
  keyText: { color: colors.text, fontSize: 12, fontWeight: '800' },
  chevron: { color: colors.textSecondary, fontSize: 24, fontWeight: '300' },
});
