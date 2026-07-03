import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alarm, AlarmDraft } from '../types/alarm';
import { useAlarms } from '../hooks/useAlarms';
import AlarmList from '../components/AlarmList';
import AlarmForm from '../components/AlarmForm';
import { colors, radius, shadow, spacing } from '../theme';

export default function AlarmListScreen() {
  const { alarms, loading, addAlarm, updateAlarm, toggleAlarm, deleteAlarm } = useAlarms();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Alarm | null>(null);

  const activeCount = alarms.filter((a) => a.enabled).length;

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (alarm: Alarm) => {
    setEditing(alarm);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const handleSubmit = async (draft: AlarmDraft) => {
    try {
      const result = editing
        ? await updateAlarm(editing.id, draft)
        : await addAlarm(draft);
      closeForm();
      if (!result.scheduled) {
        Alert.alert(
          'Notifications off',
          'The alarm was saved, but no notification was scheduled because permission was denied. Enable notifications in Settings to be alerted.'
        );
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not save alarm.');
    }
  };

  const handleToggle = async (id: string) => {
    const alarm = alarms.find((a) => a.id === id);
    const wasEnabled = alarm?.enabled;
    const result = await toggleAlarm(id);
    // Only warn if the user was turning it ON and scheduling failed.
    if (!wasEnabled && result && !result.scheduled) {
      Alert.alert(
        'Notifications off',
        'Could not schedule a notification. Check notification permission in Settings.'
      );
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete alarm', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteAlarm(id);
          closeForm();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Alarms</Text>
          <Text style={styles.subheading}>
            {alarms.length === 0
              ? 'No alarms set'
              : `${activeCount} active · ${alarms.length} total`}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <AlarmList
          alarms={alarms}
          onToggle={handleToggle}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={openAdd}
        accessibilityLabel="Add alarm"
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      {formOpen && (
        <AlarmForm
          key={editing?.id ?? 'new'}
          visible={formOpen}
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          onDelete={handleDelete}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  heading: { fontSize: 34, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  subheading: { fontSize: 15, color: colors.subtext, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl + 8,
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
    shadowOpacity: 0.28,
    shadowColor: colors.accent,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  fabPressed: { transform: [{ scale: 0.94 }], shadowOpacity: 0.18 },
  fabIcon: { color: '#fff', fontSize: 32, lineHeight: 34, fontWeight: '300', marginTop: -2 },
});
