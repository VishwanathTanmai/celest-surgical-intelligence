const QUOTA_STORAGE_KEY = "celest_monthly_quota";
const MONTHLY_LIMIT = 50;

export interface QuotaData {
  count: number;
  month: number; // 0-11
  year: number;
}

export function getQuotaData(): QuotaData {
  if (typeof window === "undefined") return { count: 0, month: 0, year: 0 };
  
  const stored = localStorage.getItem(QUOTA_STORAGE_KEY);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  if (!stored) {
    const initial: QuotaData = { count: 0, month: currentMonth, year: currentYear };
    localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  const data: QuotaData = JSON.parse(stored);

  // Reset quota if it's a new month or year
  if (data.month !== currentMonth || data.year !== currentYear) {
    const reset: QuotaData = { count: 0, month: currentMonth, year: currentYear };
    localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(reset));
    return reset;
  }

  return data;
}

export function incrementQuota(): QuotaData {
  const data = getQuotaData();
  data.count += 1;
  localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function isOverQuota(): boolean {
  const data = getQuotaData();
  return data.count >= MONTHLY_LIMIT;
}

export function getRemainingQuota(): number {
  const data = getQuotaData();
  return Math.max(0, MONTHLY_LIMIT - data.count);
}

export function getQuotaPercentage(): number {
  const data = getQuotaData();
  return Math.min(100, (data.count / MONTHLY_LIMIT) * 100);
}

export function resetQuota(): QuotaData {
  const now = new Date();
  const reset: QuotaData = { count: 0, month: now.getMonth(), year: now.getFullYear() };
  if (typeof window !== "undefined") {
    localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(reset));
  }
  return reset;
}
