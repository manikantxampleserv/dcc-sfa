/**
 * Calculates the next occurrence of 11:30 PM (23:30) and returns the Date object and remaining seconds.
 * @returns {{ expiresAt: Date, expiresInSeconds: number }}
 */
export const getNext1130PM = (): {
  expiresAt: Date;
  expiresInSeconds: number;
} => {
  const now = new Date();
  const target = new Date(now);

  target.setHours(23, 30, 0, 0);

  if (now.getTime() >= target.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const expiresInSeconds = Math.max(
    1,
    Math.floor((target.getTime() - now.getTime()) / 1000)
  );

  return { expiresAt: target, expiresInSeconds };
};

export const jwtConfig = {
  secret: (process.env.JWT_SECRET as string) || 'SFA_SECRET_KEY',
  expiresIn: '24h' as const,
  refreshExpiresIn: '7d' as const,
  getNext1130PM,
};
