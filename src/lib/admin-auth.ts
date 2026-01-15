import { cookies } from 'next/headers';
import { crmDb } from './crm-db';

const ADMIN_SESSION_COOKIE = 'admin_session';

export async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  
  if (!sessionToken) {
    return null;
  }
  
  const session = await crmDb.getSession(sessionToken);
  
  if (!session || session.user_type !== 'admin') {
    return null;
  }
  
  // Get admin user
  const admin = await crmDb.getAdminByEmail(session.email);
  
  return {
    email: session.email,
    name: admin?.name,
    token: sessionToken
  };
}

export async function setAdminSession(email: string) {
  const { token, expiresAt } = await crmDb.createSession(email, 'admin');
  
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/'
  });
  
  return token;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  
  if (sessionToken) {
    await crmDb.deleteSession(sessionToken);
  }
  
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function requireAdminAuth() {
  const session = await getAdminSession();
  
  if (!session) {
    throw new Error('Unauthorized - Admin login required');
  }
  
  return session;
}
