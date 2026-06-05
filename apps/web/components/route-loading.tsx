type RouteLoadingProps = {
  title?: string;
  variant?: 'default' | 'article' | 'list' | 'profile';
};

function LoadingBlock({ className }: { className: string }) {
  return <div className={`route-loading-block ${className}`} />;
}

function ListSkeleton() {
  return (
    <div className="route-loading-list">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="route-loading-card" />
      ))}
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <section className="route-loading-article">
      <div className="route-loading-head">
        <LoadingBlock className="route-loading-kicker" />
        <LoadingBlock className="route-loading-title-wide" />
        <LoadingBlock className="route-loading-copy" />
        <LoadingBlock className="route-loading-action" />
      </div>
      <div className="route-loading-body" />
      <div className="route-loading-comments" />
    </section>
  );
}

function ProfileSkeleton() {
  return (
    <section className="route-loading-profile">
      <div className="route-loading-profile-card">
        <LoadingBlock className="route-loading-avatar" />
        <LoadingBlock className="route-loading-title" />
        <LoadingBlock className="route-loading-copy-wide" />
      </div>
      <ListSkeleton />
    </section>
  );
}

export function RouteLoading({
  title = '화면을 불러오는 중입니다.',
  variant = 'default',
}: RouteLoadingProps) {
  if (variant === 'article') {
    return (
      <main className="route-loading-page">
        <ArticleSkeleton />
      </main>
    );
  }

  if (variant === 'profile') {
    return (
      <main className="route-loading-page">
        <ProfileSkeleton />
      </main>
    );
  }

  return (
    <main className="route-loading-page">
      <section className="route-loading-shell">
        <div className="route-loading-head">
          <LoadingBlock className="route-loading-kicker" />
          <LoadingBlock className="route-loading-title" />
          <p>{title}</p>
        </div>
        {variant === 'list' ? <ListSkeleton /> : <div className="route-loading-panel" />}
      </section>
    </main>
  );
}
