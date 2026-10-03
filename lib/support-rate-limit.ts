const windows = new Map<string, { startedAt: number; count: number }>();

export function allowSupportMessage(userId: string, now = Date.now()) {
  if (windows.size > 2000) {
    for (const [key, window] of windows) if (now - window.startedAt > 60_000) windows.delete(key);
  }
  const current = windows.get(userId);
  if (!current || now - current.startedAt >= 60_000) {
    windows.set(userId, { startedAt: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= 8;
}