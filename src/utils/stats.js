// สถิติแบบเดียวกับสูตรใน Excel: AVERAGE และ STDEV (ส่วนเบี่ยงเบนมาตรฐานของตัวอย่าง)
export const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
export function sd(a) {
  if (a.length < 2) return null;
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
}
export function level(m) {
  if (m == null) return '-';
  if (m >= 4.51) return 'มากที่สุด';
  if (m >= 3.51) return 'มาก';
  if (m >= 2.51) return 'ปานกลาง';
  if (m >= 1.51) return 'น้อย';
  return 'น้อยที่สุด';
}
export const fmt = (x) => (x == null ? '-' : x.toFixed(2));
