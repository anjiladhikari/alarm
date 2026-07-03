import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Alarm, AlarmDraft, WeekDay } from '../types/alarm';
import { isValidTime } from '../utils/time';
import { colors, radius, spacing } from '../theme';
import TimePicker from './TimePicker';

const DAYS: { day: WeekDay; label: string }[] = [
  { day: 0, label: 'S' },
  { day: 1, label: 'M' },
  { day: 2, label: 'T' },
  { day: 3, label: 'W' },
  { day: 4, label: 'T' },
  { day: 5, label: 'F' },
  { day: 6, label: 'S' },
];

type Props = {
  visible: boolean;
  initial: Alarm | null; // null = adding, otherwise editing
  onSubmit: (draft: AlarmDraft) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
};

export default function AlarmForm({ visible, initial, onSubmit, onCancel, onDelete }: Props) {
  const [time, setTime] = useState(initial?.time ?? '07:00');
  const [label, setLabel] = useState(initial?.label ?? '');
  const [repeatDays, setRepeatDays] = useState<WeekDay[]>(initial?.repeatDays ?? []);

  const toggleDay = (day: WeekDay) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const timeValid = isValidTime(time);

  const handleSubmit = () => {
    if (!timeValid) return; // guard; the picker shows the inline error
    onSubmit({ time: time.trim(), label: label.trim(), repeatDays });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdropTouch} onPress={onCancel} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{initial ? 'Edit alarm' : 'New alarm'}</Text>

          <Text style={styles.fieldLabel}>TIME</Text>
          <TimePicker value={time} onChange={setTime} />

          <Text style={styles.fieldLabel}>LABEL</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="Wake up"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.fieldLabel}>REPEAT</Text>
          <View style={styles.days}>
            {DAYS.map(({ day, label: dl }) => {
              const on = repeatDays.includes(day);
              return (
                <Pressable
                  key={day}
                  onPress={() => toggleDay(day)}
                  style={[styles.day, on && styles.dayOn]}
                >
                  <Text style={[styles.dayText, on && styles.dayTextOn]}>{dl}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.buttons}>
            <Pressable style={[styles.button, styles.cancel]} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.save, !timeValid && styles.saveDisabled]}
              onPress={handleSubmit}
              disabled={!timeValid}
            >
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>

          {initial && onDelete ? (
            <Pressable style={styles.delete} onPress={() => onDelete(initial.id)}>
              <Text style={styles.deleteText}>Delete alarm</Text>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.45)' },
  backdropTouch: { flex: 1 },
  sheet: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl + 12,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: {
    flex: 1,
    marginHorizontal: 3,
    aspectRatio: 1,
    maxWidth: 44,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  dayText: { color: colors.subtext, fontSize: 14, fontWeight: '600' },
  dayTextOn: { color: '#fff' },
  buttons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  button: { flex: 1, paddingVertical: 15, borderRadius: radius.sm, alignItems: 'center' },
  cancel: { backgroundColor: colors.bg },
  cancelText: { color: colors.subtext, fontSize: 16, fontWeight: '600' },
  save: { backgroundColor: colors.accent },
  saveDisabled: { backgroundColor: colors.muted, opacity: 0.6 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  delete: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.sm },
  deleteText: { color: colors.danger, fontSize: 15, fontWeight: '600' },
});
