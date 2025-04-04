import { totp } from 'otplib';
import { supabase } from '../lib/supabase';

export class OTPService {
  private static readonly OTP_VALIDITY_MINUTES = 5;

  static async generateOTP(userType: 'manufacturer' | 'distributor' | 'retailer', userId: string): Promise<string> {
    const secret = totp.generateSecret();
    const otp = totp.generate(secret);
    const validUntil = new Date();
    validUntil.setMinutes(validUntil.getMinutes() + this.OTP_VALIDITY_MINUTES);

    // Update the user's OTP secret and validity
    const { error } = await supabase
      .from(userType + 's')
      .update({
        otp_secret: secret,
        otp_valid_until: validUntil.toISOString()
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to generate OTP: ${error.message}`);
    }

    return otp;
  }

  static async verifyOTP(
    userType: 'manufacturer' | 'distributor' | 'retailer',
    userId: string,
    otpToken: string
  ): Promise<boolean> {
    // Get the user's OTP secret and validity
    const { data, error } = await supabase
      .from(userType + 's')
      .select('otp_secret, otp_valid_until')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new Error('Failed to verify OTP');
    }

    const { otp_secret, otp_valid_until } = data;

    // Check if OTP is still valid
    if (new Date(otp_valid_until) < new Date()) {
      return false;
    }

    // Verify the OTP
    try {
      const isValid = totp.verify({
        token: otpToken,
        secret: otp_secret
      });

      if (isValid) {
        // Update verification status
        await supabase
          .from(userType + 's')
          .update({
            verification_status: true,
            otp_secret: null,
            otp_valid_until: null
          })
          .eq('id', userId);
      }

      return isValid;
    } catch {
      return false;
    }
  }
}