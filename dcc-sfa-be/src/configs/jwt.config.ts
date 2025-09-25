export const jwtConfig = {
  secret: (process.env.JWT_SECRET as string) || 'your-secret-key',
  expiresIn: '24h' as const,
  refreshExpiresIn: '7d' as const,
};
