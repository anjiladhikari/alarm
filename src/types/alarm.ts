// Day of week: 0 = Sunday ... 6 = Saturday
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Alarm {
  id: string;
  time: string; // "HH:mm" 24-hour format
  label: string;
  enabled: boolean;
  repeatDays: WeekDay[]; // empty = one-shot (fires once)
  notificationId: string | null; // scheduled Expo notification id, null if not scheduled
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

// Fields the user can edit in the form.
export type AlarmDraft = Pick<Alarm, 'time' | 'label' | 'repeatDays'>;
