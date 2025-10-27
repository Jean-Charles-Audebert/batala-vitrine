const isProd = process.env.NODE_ENV === 'production';

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
};

export const accessCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
};

export function clearCookieOptions() {
  // options à utiliser pour res.clearCookie
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
  };
}
