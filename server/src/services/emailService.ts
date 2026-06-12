import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  async sendPasswordResetEmail(to: string, otpCode: string) {
    try {
      await resend.emails.send({
        from: 'PUConnect <onboarding@resend.dev>', // Replace with your verified domain in production!
        to: [to],
        subject: 'Your PUConnect Password Reset OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a1a;">Password Reset OTP</h2>
            <p style="color: #4a4a4a; line-height: 1.5;">
              Hi there! You requested to reset your PUConnect password. Here's your one-time passcode (OTP):
            </p>
            <div style="background-color: #f3f4f6; padding: 16px 24px; border-radius: 8px; margin: 16px 0; text-align: center;">
              <span style="font-size: 32px; font-weight: 700; color: #6366f1; letter-spacing: 8px;">
                ${otpCode}
              </span>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              This OTP expires in 10 minutes. If you didn't request this, just ignore this email and your password will remain unchanged.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
              — The PUConnect Team
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send password reset OTP email:', error);
      throw error;
    }
  },
};