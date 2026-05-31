import { getNestStatus, type ServiceStatus } from '@/lib/backend';
import { getDatabaseSummary } from '@/lib/database-summary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SummaryItem = {
  label: string;
  value: string;
};

function StatusPill({ status }: { status: ServiceStatus['status'] }) {
  const className =
    status === 'ready' ? 'status status-ready' : 'status status-offline';

  return <span className={className}>{status}</span>;
}

function ServiceCard({ service }: { service: ServiceStatus }) {
  return (
    <article className="card">
      <div className="card-head">
        <div>
          <p className="card-kicker">{service.kind}</p>
          <h2>{service.name}</h2>
        </div>
        <StatusPill status={service.status} />
      </div>
      <p className="card-detail">{service.detail}</p>
      <code className="endpoint">{service.endpoint}</code>
    </article>
  );
}

export default async function Home() {
  const nestStatus = await getNestStatus();
  const database = await getDatabaseSummary();

  const services: ServiceStatus[] = [
    nestStatus,
    {
      name: 'Prisma + SQLite',
      kind: 'Shared database package',
      status: 'ready',
      detail:
        'Next.js can read the same SQLite database through @repo/database.',
      endpoint: '/api/db/summary',
    },
  ];

  const summary: SummaryItem[] = [
    { label: 'Nest', value: 'apps/api-nest, port 3001' },
    { label: 'Prisma', value: '@repo/database' },
    { label: 'SQLite', value: database.sqliteUrl },
    { label: 'Proxy', value: '/api/nest/:path* -> NEST_API_URL/api/:path*' },
  ];

  return (
    <main className="page">
      <section className="shell">
        <div className="hero">
          <div>
            <p className="eyebrow">RealWorld2</p>
            <h1>Nest, Prisma, SQLite 상태를 한 화면에서 확인합니다</h1>
            <p>
              Next.js 대시보드가 Nest API 상태를 확인하고 공유
              Prisma/SQLite 패키지에서 현재 데이터 수를 직접 읽습니다.
            </p>
          </div>
          <aside className="runtime" aria-label="Frontend runtime">
            <p className="runtime-label">Frontend</p>
            <p className="runtime-value">Next.js 16</p>
          </aside>
        </div>

        <div className="services">
          {services.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>

        <section className="content-grid">
          <div className="summary-panel">
            <p className="card-kicker">Integration</p>
            <h2>프로젝트 연결 요약</h2>
            <p className="summary-copy">
              `apps/api-nest`는 RealWorld API 도메인을 제공하고,
              `apps/web`은 Nest API 프록시와 데이터베이스 요약 API를 통해
              백엔드와 공유 DB 상태를 확인합니다.
            </p>
            <div className="summary-grid">
              {summary.map((item) => (
                <div className="summary-item" key={item.label}>
                  <p className="summary-label">{item.label}</p>
                  <p className="summary-value">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="metrics-panel">
            <p className="card-kicker">SQLite data</p>
            <h2>현재 DB 레코드 수</h2>
            <div className="metrics-grid">
              {Object.entries(database.counts).map(([name, count]) => (
                <div className="metric" key={name}>
                  <p className="metric-label">{name}</p>
                  <p className="metric-value">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
