'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { RouteStatusScreen } from '@/components/route-status-screen';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <RouteStatusScreen
      eyebrow="Error"
      code="500"
      title="화면을 불러오는 중 문제가 발생했습니다."
      description="일시적인 API 연결 문제이거나 예상하지 못한 오류일 수 있습니다. 다시 시도하거나 게시글 목록으로 이동하세요."
    >
      <button type="button" onClick={reset} className="route-status-primary">
        다시 시도
      </button>
      <Link href="/articles" className="route-status-secondary">
        Articles
      </Link>
      <Link href="/" className="route-status-secondary">
        Home
      </Link>
    </RouteStatusScreen>
  );
}
