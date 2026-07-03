import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '../types/alarm';

const STORAGE_KEY = 'alarms:v1';

/** Loads all alarms from local storage. Returns [] on empty or corrupt data. */
export async function loadAlarms(): Promise<Alarm[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Alarm[]) : [];
  } catch (err) {
    console.warn('Failed to load alarms, starting empty.', err);
    return [];
  }
}

/** Persists the full alarm list to local storage. */
export async function saveAlarms(alarms: Alarm[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
  } catch (err) {
    console.warn('Failed to save alarms.', err);
    throw new Error('Could not save alarms to device storage.');
  }
}
