/**
 * Shared 10-day healing-plan persistence (localStorage).
 * Used by HabitTracker (the full plan view) and the Dashboard (live plan summary),
 * so both read/compute the streak the same way. Demo persistence; real sync arrives
 * with the backend.
 */
export const TOTAL_DAYS = 10;
export const STORAGE_KEY = "dreamai-habit-tracker";

export interface TrackerData {
  startDate: string;
  completedDays: number[];
  streak: number;
}

export function getStoredData(): TrackerData {
  if (typeof window === "undefined") return { startDate: "", completedDays: [], streak: 0 };
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore malformed data and reseed below
    }
  }
  const data: TrackerData = {
    startDate: new Date().toISOString().split("T")[0],
    completedDays: [],
    streak: 0,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function getDayNumber(startDate: string): number {
  if (!startDate) return 1;
  const start = new Date(startDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(diff + 1, TOTAL_DAYS);
}
