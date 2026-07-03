import { useCallback, useEffect, useState } from 'react';
import { Alarm, AlarmDraft } from '../types/alarm';
import { loadAlarms, saveAlarms } from '../services/storage';
import {
  ensurePermission,
  scheduleAlarm,
  cancelAlarm,
} from '../services/notifications';

function makeId(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/**
 * Owns the in-memory alarm list and all CRUD.
 * Persists every change to AsyncStorage and keeps notifications in sync.
 */
export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlarms()
      .then(setAlarms)
      .finally(() => setLoading(false));
  }, []);

  // Persist a new list to state + storage in one place.
  const persist = useCallback(async (next: Alarm[]) => {
    setAlarms(next);
    await saveAlarms(next);
  }, []);

  const addAlarm = useCallback(
    async (draft: AlarmDraft) => {
      const now = Date.now();
      let alarm: Alarm = {
        id: makeId(),
        time: draft.time,
        label: draft.label,
        enabled: true,
        repeatDays: draft.repeatDays,
        notificationId: null,
        createdAt: now,
        updatedAt: now,
      };

      const granted = await ensurePermission();
      if (granted) {
        alarm.notificationId = await scheduleAlarm(alarm);
      }
      await persist([...alarms, alarm]);
      return { scheduled: granted };
    },
    [alarms, persist]
  );

  const updateAlarm = useCallback(
    async (id: string, draft: AlarmDraft) => {
      const existing = alarms.find((a) => a.id === id);
      if (!existing) return { scheduled: false };

      // Cancel the old schedule and reschedule from the new values.
      await cancelAlarm(existing.notificationId);

      const updated: Alarm = {
        ...existing,
        ...draft,
        updatedAt: Date.now(),
        notificationId: null,
      };

      let granted = false;
      if (updated.enabled) {
        granted = await ensurePermission();
        if (granted) {
          updated.notificationId = await scheduleAlarm(updated);
        }
      }
      await persist(alarms.map((a) => (a.id === id ? updated : a)));
      return { scheduled: granted };
    },
    [alarms, persist]
  );

  const toggleAlarm = useCallback(
    async (id: string) => {
      const existing = alarms.find((a) => a.id === id);
      if (!existing) return { scheduled: false };

      const enabled = !existing.enabled;
      let notificationId = existing.notificationId;

      if (enabled) {
        const granted = await ensurePermission();
        notificationId = granted ? await scheduleAlarm(existing) : null;
        if (!granted) {
          // Reflect the toggle but nothing was scheduled.
          await persist(
            alarms.map((a) =>
              a.id === id ? { ...a, enabled, notificationId: null, updatedAt: Date.now() } : a
            )
          );
          return { scheduled: false };
        }
      } else {
        await cancelAlarm(existing.notificationId);
        notificationId = null;
      }

      await persist(
        alarms.map((a) =>
          a.id === id ? { ...a, enabled, notificationId, updatedAt: Date.now() } : a
        )
      );
      return { scheduled: enabled };
    },
    [alarms, persist]
  );

  const deleteAlarm = useCallback(
    async (id: string) => {
      const existing = alarms.find((a) => a.id === id);
      if (existing) await cancelAlarm(existing.notificationId);
      await persist(alarms.filter((a) => a.id !== id));
    },
    [alarms, persist]
  );

  return { alarms, loading, addAlarm, updateAlarm, toggleAlarm, deleteAlarm };
}
