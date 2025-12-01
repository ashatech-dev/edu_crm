type ENV_CONFIGS_TYPE = {
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  ACCESS_TOKEN_EXPIRY: string;
  REFRESH_TOKEN_EXPIRY: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FRONTEND_URL: string;
  NODE_ENV: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  FACEBOOK_CLIENT_ID: string;
  FACEBOOK_CLIENT_SECRET: string;
  FACEBOOK_REDIRECT_URI: string;
  ORG_NAME: string;
};

function CONFIGS(): ENV_CONFIGS_TYPE {
  return {
    PORT: Number(process.env.PORT) || 5000,
    MONGODB_URI: process.env.MONGODB_URI as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    SMTP_HOST: process.env.SMTP_HOST || "smtp.domain.com",
    SMTP_PORT: Number(process.env.SMTP_PORT) || 465,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY as string,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID as string,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL as string,
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    NODE_ENV: process.env.NODE_ENV || "development",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI as string,
    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID as string,
    FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET as string,
    FACEBOOK_REDIRECT_URI: process.env.FACEBOOK_REDIRECT_URI as string,
    ORG_NAME: process.env.ORG_NAME as string,
  };
}

export const ENV_CONFIGS = CONFIGS();
