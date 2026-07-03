import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Period, to12Hour, to24Hour } from '../utils/time';
import { colors, radius, spacing } from '../theme';

// 12-hour time entry with AM/PM. The user types digits only — the colon is
// inserted automatically, and "7" and "07" mean the same hour.
// Emits 24-hour "HH:mm" to the parent (empty string while incomplete/invalid).
//
// Digit rules (left to right):
//   "7"    -> 7:00     "07"   -> 7:00
//   "730"  -> 7:30     "0730" -> 07:30 (7:30)
type Props = {
  value: string; // initial 24h "HH:mm"
  onChange: (text: string) => void;
};

function partsFromDigits(d: string): { hour: number; minute: number } | null {
  if (d.length === 0) return null;
  let hour: number;
  let minute: number;
  if (d.length <= 2) {
    hour = parseInt(d, 10);
    minute = 0;
  } else if (d.length === 3) {
    hour = parseInt(d[0], 10);
    minute = parseInt(d.slice(1), 10);
  } else {
    hour = parseInt(d.slice(0, 2), 10);
    minute = parseInt(d.slice(2), 10);
  }
  if (hour < 1 || hour > 12 || minute > 59) return null;
  return { hour, minute };
}

function displayFromDigits(d: string): string {
  if (d.length <= 2) return d;
  if (d.length === 3) return `${d[0]}:${d.slice(1)}`;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
}

function digitsFromParts(hour: number, minute: number): string {
  return `${hour}${String(minute).padStart(2, '0')}`;
}

export default function TimePicker({ value, onChange }: Props) {
  // Initialise once from the incoming 24h value; after that this owns its state.
  const [state] = useState(() => {
    try {
      const { hour12, minute, period } = to12Hour(value);
      return { digits: digitsFromParts(hour12, minute), period };
    } catch {
      return { digits: '', period: 'AM' as Period };
    }
  });
  const [digits, setDigits] = useState(state.digits);
  const [period, setPeriod] = useState<Period>(state.period);

  const parts = partsFromDigits(digits);
  const valid = parts !== null;

  const commit = (nextDigits: string, nextPeriod: Period) => {
    setDigits(nextDigits);
    setPeriod(nextPeriod);
    const p = partsFromDigits(nextDigits);
    onChange(p ? to24Hour(p.hour, p.minute, nextPeriod) : ''); // '' -> Save disabled
  };

  const onType = (text: string) => {
    const d = text.replace(/\D/g, '').slice(0, 4); // digits only, max HHMM
    commit(d, period);
  };

  const stepHour = (delta: number) => {
    const base = parts ?? { hour: 7, minute: 0 };
    const hour = ((base.hour - 1 + delta + 12) % 12) + 1; // wrap 1..12
    commit(digitsFromParts(hour, base.minute), period);
  };

  const stepMinute = (delta: number) => {
    const base = parts ?? { hour: 7, minute: 0 };
    const minute = (base.minute + delta + 60) % 60; // wrap 0..59
    commit(digitsFromParts(base.hour, minute), period);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <TextInput
          style={[styles.input, !valid && styles.inputError]}
          value={displayFromDigits(digits)}
          onChangeText={onType}
          placeholder="7:30"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          maxLength={5}
          selectTextOnFocus
          accessibilityLabel="Alarm time"
        />

        <View style={styles.periodCol}>
          <Pressable
            onPress={() => commit(digits, 'AM')}
            style={[styles.period, period === 'AM' && styles.periodOn]}
          >
            <Text style={[styles.periodText, period === 'AM' && styles.periodTextOn]}>AM</Text>
          </Pressable>
          <Pressable
            onPress={() => commit(digits, 'PM')}
            style={[styles.period, period === 'PM' && styles.periodOn]}
          >
            <Text style={[styles.periodText, period === 'PM' && styles.periodTextOn]}>PM</Text>
          </Pressable>
        </View>
      </View>

      {!valid ? <Text style={styles.hint}>Enter a time like 7:30</Text> : null}

      <View style={styles.controls}>
        <Adjust label="Hour" onMinus={() => stepHour(-1)} onPlus={() => stepHour(1)} />
        <Adjust label="Minute" onMinus={() => stepMinute(-1)} onPlus={() => stepMinute(1)} />
      </View>
    </View>
  );
}

function Adjust({
  label,
  onMinus,
  onPlus,
}: {
  label: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <View style={styles.adjust}>
      <Text style={styles.adjustLabel}>{label}</Text>
      <View style={styles.adjustRow}>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={onMinus}
          hitSlop={6}
          accessibilityLabel={`Decrease ${label}`}
        >
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={onPlus}
          hitSlop={6}
          accessibilityLabel={`Increase ${label}`}
        >
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  input: {
    fontSize: 52,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
    paddingVertical: spacing.sm,
    minWidth: 150,
  },
  inputError: { color: colors.danger },
  periodCol: { marginLeft: spacing.lg, gap: spacing.sm },
  period: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    minWidth: 56,
    alignItems: 'center',
  },
  periodOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  periodText: { fontSize: 15, fontWeight: '700', color: colors.subtext },
  periodTextOn: { color: '#fff' },
  hint: { textAlign: 'center', color: colors.danger, fontSize: 13, marginTop: 2 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  adjust: { alignItems: 'center' },
  adjustLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  adjustRow: { flexDirection: 'row', gap: spacing.sm },
  btn: {
    width: 52,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: { backgroundColor: colors.border },
  btnText: { fontSize: 26, lineHeight: 28, fontWeight: '800', color: colors.accent },
});
