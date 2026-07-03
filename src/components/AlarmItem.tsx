import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Alarm } from '../types/alarm';
import { colors, radius, shadow, spacing } from '../theme';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type Props = {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
};

function repeatSummary(days: Alarm['repeatDays']): string {
  if (days.length === 0) return 'Once';
  if (days.length === 7) return 'Every day';
  const sorted = days.slice().sort((a, b) => a - b);
  const isWeekdays = sorted.join() === '1,2,3,4,5';
  const isWeekends = sorted.join() === '0,6';
  if (isWeekdays) return 'Weekdays';
  if (isWeekends) return 'Weekends';
  return sorted.map((d) => DAY_LABELS[d]).join('  ');
}

export default function AlarmItem({ alarm, onToggle, onEdit, onDelete }: Props) {
  const dim = !alarm.enabled;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onEdit(alarm)}
      onLongPress={() => onDelete(alarm.id)}
      delayLongPress={350}
    >
      <View style={styles.left}>
        <Text style={[styles.time, dim && styles.dim]}>{alarm.time}</Text>
        <Text style={[styles.label, dim && styles.dimLabel]} numberOfLines={1}>
          {alarm.label || 'Alarm'}
        </Text>
        <View style={styles.repeatRow}>
          <View style={[styles.repeatPill, dim && styles.repeatPillDim]}>
            <Text style={[styles.repeatText, dim && styles.repeatTextDim]}>
              {repeatSummary(alarm.repeatDays)}
            </Text>
          </View>
        </View>
      </View>

      <Switch
        value={alarm.enabled}
        onValueChange={() => onToggle(alarm.id)}
        trackColor={{ false: colors.switchTrackOff, true: colors.switchOn }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={colors.switchTrackOff}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    ...shadow,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.995 }] },
  left: { flex: 1, paddingRight: spacing.md },
  time: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  label: { fontSize: 15, color: colors.subtext, marginTop: 2 },
  dim: { color: colors.muted },
  dimLabel: { color: colors.muted },
  repeatRow: { flexDirection: 'row', marginTop: spacing.sm },
  repeatPill: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  repeatPillDim: { backgroundColor: colors.bg },
  repeatText: { fontSize: 12.5, fontWeight: '600', color: colors.accent, letterSpacing: 0.3 },
  repeatTextDim: { color: colors.muted },
});
