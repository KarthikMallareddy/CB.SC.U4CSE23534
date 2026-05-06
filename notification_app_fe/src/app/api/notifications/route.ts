import { NextResponse } from 'next/server';
import axios from 'axios';

const EVALUATION_BASE = 'http://20.207.122.201/evaluation-service';

// Cache the token for the lifetime of the server process
let cachedToken: string | null = null;

/**
 * Authenticates with the evaluation service.
 * Inlined here because Turbopack on Windows does not support absolute path aliases
 * for local packages. The logging_middleware package is used in Node environments
 * (backend), while this file runs inside the Next.js edge/turbopack runtime.
 */
async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;

  const response = await axios.post(`${EVALUATION_BASE}/auth`, {
    email: process.env.EMAIL,
    name: process.env.NAME,
    rollNo: process.env.ROLL_NO,
    accessCode: process.env.ACCESS_CODE,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });

  cachedToken = response.data.access_token;
  return cachedToken!;
}

/**
 * Sends a log to the evaluation service (inlined for same reason as above).
 */
async function log(stack: string, level: string, pkg: string, message: string): Promise<void> {
  try {
    const token = await getToken();
    await axios.post(
      `${EVALUATION_BASE}/logs`,
      { stack, level, package: pkg, message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch {
    // Logging must never crash the app
  }
}

export async function GET(request: Request) {
  try {
    const token = await getToken();
    await log('frontend', 'info', 'api', 'Fetching notifications from evaluation service');

    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();

    const limit = searchParams.get('limit');
    const page = searchParams.get('page');
    const notificationType = searchParams.get('notification_type');

    if (limit) params.append('limit', limit);
    if (page) params.append('page', page);
    if (notificationType) params.append('notification_type', notificationType);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const apiUrl = `${EVALUATION_BASE}/notifications${queryString}`;

    await log('frontend', 'debug', 'api', `GET ${apiUrl}`);

    const response = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const count = response.data.notifications?.length ?? 0;
    await log('frontend', 'info', 'api', `Successfully fetched ${count} notifications`);

    return NextResponse.json(response.data);
  } catch (error: any) {
    await log('frontend', 'error', 'api', `Failed to fetch notifications: ${error.message}`).catch(() => {});
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
