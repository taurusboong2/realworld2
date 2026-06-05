import { RouteStatusScreen } from '@/components/route-status-screen';

export default function NotFound() {
  return (
    <RouteStatusScreen
      eyebrow="Not found"
      code="404"
      title="요청한 페이지를 찾을 수 없습니다."
      description="주소가 바뀌었거나 삭제된 페이지입니다. 게시글 목록으로 이동해 현재 확인 가능한 콘텐츠를 다시 찾아보세요."
    />
  );
}
