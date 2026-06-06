import { cookies } from 'next/headers';

export const getServerApiHeaders = async (): Promise<Record<string, string>> => {
  const cookieHeader = (await cookies()).toString();

  return cookieHeader ? { Cookie: cookieHeader } : {};
};
