export const jwtConfig = {
  secret: (process.env.JWT_SECRET as string) || 'SFA_SECRET_KEY',
  expiresIn: '24h' as const,
  refreshExpiresIn: '7d' as const,
};