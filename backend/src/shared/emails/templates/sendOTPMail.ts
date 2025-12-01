import { ENV_CONFIGS } from "../../config/envs.config";

export function getOTPEmailTemplate(username: string, otp: number) {
  return {
    subject: `Welcome to ${ENV_CONFIGS.ORG_NAME}, ${username}!`,
    html: `
          <h1>Welcome, ${username} 👋</h1>
          <p>You're otp is ${otp}!</p>
          <p>Thank you for visiting us!</p>
        `,
    text: `Welcome, ${username}! You're otp is ${otp}.`,
  };
}
