import { getNestStatus, type ServiceStatus } from '@/lib/backend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

  const services: ServiceStatus[] = [
    nestStatus,
  ];

  return (
    <main className="page">
      <section className="shell">
        <div className="hero">
          <div>
            <p className="eyebrow">RealWorld2</p>
            <h1>Nest API와 연결된 RealWorld 흐름을 확인합니다</h1>
            <p>
              Next.js 대시보드가 Nest API 상태를 확인하고, 게시글과
              프로필 중심의 RealWorld 기능 흐름을 제공합니다.
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

        <section className="summary-panel">
          <p className="card-kicker">Integration</p>
          <h2>프로젝트 요약</h2>
          <p className="summary-copy">
            `apps/api-nest`가 사용자, 프로필, 게시글, 댓글, 태그 API를
            제공하고, `apps/web`은 Nest API와 연결된 Next.js 앱입니다. 주요
            기능은 게시글 작성/수정/삭제, 태그 필터, 프로필, 팔로우, 좋아요,
            댓글 흐름으로 구성되어 있습니다.
          </p>
        </section>
      </section>
    </main>
  );
}
