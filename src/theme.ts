// Small shared design tokens so the UI stays consistent. Not a library — just constants.
export const colors = {
  bg: '#F1F5F9',
  card: '#FFFFFF',
  text: '#0F172A',
  subtext: '#64748B',
  muted: '#94A3B8',
  border: '#E2E8F0',
  accent: '#6366F1',
  accentSoft: '#EEF0FE',
  danger: '#EF4444',
  dangerSoft: '#FEECEC',
  switchOn: '#6366F1',
  switchTrackOff: '#CBD5E1',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 };

export const shadow = {
  // Soft card elevation that reads well on iOS and Android.
  shadowColor: '#0F172A',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};
