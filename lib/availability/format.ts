export function minutesToTime(m: number) {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const ampm = h >= 12 ? 'pm' : 'am';
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${String(mm).padStart(2, '0')} ${ampm}`;
}

export function timeStringToMinutes(value: string): number | null {
  const [h, m] = value.split(':').map(Number);
  if (h == null || m == null || Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}
