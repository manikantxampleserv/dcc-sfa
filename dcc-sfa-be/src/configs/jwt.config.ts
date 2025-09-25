export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  expiresIn: '24h',
  refreshExpiresIn: '7d',
};
