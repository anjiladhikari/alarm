import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Alarm } from '../types/alarm';
import AlarmItem from './AlarmItem';
import { colors, radius, spacing } from '../theme';

type Props = {
  alarms: Alarm[];
  onToggle: (id: string) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
};

export default function AlarmList({ alarms, onToggle, onEdit, onDelete }: Props) {
  if (alarms.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>⏰</Text>
        </View>
        <Text style={styles.emptyTitle}>No alarms yet</Text>
        <Text style={styles.emptyHint}>
          Tap the + button to create your first alarm.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={alarms}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <AlarmItem alarm={item} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyIconText: { fontSize: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  emptyHint: {
    fontSize: 15,
    color: colors.subtext,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 21,
  },
});
