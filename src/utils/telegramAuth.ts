export function parseInitData(initData: string): Record<string, string> | null {
  if (!initData) return null;
  try {
    const params = new URLSearchParams(initData);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  } catch {
    return null;
  }
}

export function isInitDataValid(initData: string): boolean {
  if (!initData) return false;
  const parsed = parseInitData(initData);
  if (!parsed) return false;
  if (!parsed.hash || !parsed.auth_date) return false;
  const authDate = parseInt(parsed.auth_date, 10);
  const now = Math.floor(Date.now() / 1000);
  if (isNaN(authDate) || now - authDate > 86400) return false;
  return true;
}

export function getUserFromInitData(initData: string): {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
} | null {
  const parsed = parseInitData(initData);
  if (!parsed?.user) return null;
  try {
    return JSON.parse(parsed.user);
  } catch {
    return null;
  }
}
