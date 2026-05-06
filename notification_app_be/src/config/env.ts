import dotenv from 'dotenv';
dotenv.config();

/**
 * Centralised environment configuration.
 * Throws early if any required variable is missing so the app
 * fails fast at startup rather than at runtime.
 */
const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  evaluationService: {
    baseUrl: 'http://20.207.122.201/evaluation-service',
    email: required('EMAIL'),
    name: required('NAME'),
    rollNo: required('ROLL_NO'),
    accessCode: required('ACCESS_CODE'),
    clientID: required('CLIENT_ID'),
    clientSecret: required('CLIENT_SECRET'),
  },
};
