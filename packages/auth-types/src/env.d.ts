declare namespace NodeJS {
  interface ProcessEnv {
    SMTP_HOST: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    BETTER_AUTH_URL: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    NODE_ENV: string;
  }
}
