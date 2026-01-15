import { cookies } from 'next/headers';
import { crmDb } from './crm-db';

const CLIENT_SESSION_COOKIE = 'client_session';

export async function getClientSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;
  
  if (!sessionToken) {
    return null;
  }
  
  const session = await crmDb.getSession(sessionToken);
  
  if (!session || session.user_type !== 'client') {
    return null;
  }
  
  // Get client info
  const client = await crmDb.getClientByEmail(session.email);
  
  if (!client || !client.portal_access) {
    return null;
  }
  
  return {
    id: client.id,
    email: client.email,
    name: client.name,
    company: client.company,
    token: sessionToken
  };
}

export async function setClientSession(email: string) {
  const { token, expiresAt } = await crmDb.createSession(email, 'client');
  
  const cookieStore = await cookies();
  cookieStore.set(CLIENT_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/'
  });
  
  return token;
}

export async function clearClientSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;
  
  if (sessionToken) {
    await crmDb.deleteSession(sessionToken);
  }
  
  cookieStore.delete(CLIENT_SESSION_COOKIE);
}

export async function requireClientAuth() {
  const session = await getClientSession();
  
  if (!session) {
    throw new Error('Unauthorized - Client login required');
  }
  
  return session;
}
