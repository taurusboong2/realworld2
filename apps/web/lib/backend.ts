export type ServiceStatus = {
  name: string;
  kind: string;
  status: 'ready' | 'offline';
  detail: string;
  endpoint: string;
};

export async function getNestStatus(): Promise<ServiceStatus> {
  const baseUrl = process.env.NEST_API_URL ?? 'http://localhost:3001';

  try {
    const response = await fetch(`${baseUrl}/api`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const body = await response.text();

    return {
      name: 'Nest API',
      kind: 'RealWorld REST API',
      status: 'ready',
      detail: body || 'Nest backend is reachable.',
      endpoint: '/api/nest',
    };
  } catch {
    return {
      name: 'Nest API',
      kind: 'RealWorld REST API',
      status: 'offline',
      detail: 'Start it with corepack pnpm nest:dev.',
      endpoint: '/api/nest',
    };
  }
}
