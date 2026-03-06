import crypto from 'crypto';
import prisma from '../configs/prisma.client';

export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
};

export const storeOTP = async (
  email: string,
  otpCode: string,
  ipAddress?: string,
  userAgent?: string,
  logInst?: number
): Promise<boolean> => {
  try {
    await prisma.password_reset_otps.updateMany({
      where: {
        email,
        is_active: 'Y',
        is_used: false,
        expires_at: {
          gt: new Date(),
        },
      },
      data: {
        is_active: 'N',
        updated_at: new Date(),
      },
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.password_reset_otps.create({
      data: {
        email,
        otp_code: otpCode,
        expires_at: expiresAt,
        ip_address: ipAddress,
        user_agent: userAgent,
        is_active: 'Y',
        createdby: 0,
        log_inst: logInst,
      },
    });

    return true;
  } catch (error) {
    console.error('Error storing OTP:', error);
    return false;
  }
};

export const verifyOTP = async (
  email: string,
  otpCode: string
): Promise<boolean> => {
  try {
    const otpRecord = await prisma.password_reset_otps.findFirst({
      where: {
        email,
        otp_code: otpCode,
        is_active: 'Y',
        is_used: false,
        expires_at: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return false;
    }

    await prisma.password_reset_otps.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        is_used: true,
        updated_at: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
};

export const cleanupExpiredOTPs = async (): Promise<void> => {
  try {
    await prisma.password_reset_otps.updateMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
        is_active: 'Y',
      },
      data: {
        is_active: 'N',
        updated_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
  }
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
