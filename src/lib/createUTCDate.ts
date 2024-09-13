export default function createUTCDate(date?: Date | string) {
  const d = typeof date === 'undefined' ? new Date() : new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}
