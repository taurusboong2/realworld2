import { Suspense } from 'react';
import { ProtectedPageShell } from '@/components/protected-page-shell';
import { RequireAuth } from '@/components/require-auth';

export default function SettingsPage() {
  return (
    <Suspense>
      <RequireAuth>
        <ProtectedPageShell
          eyebrow="Account"
          title="프로필과 계정 설정"
          description="인증된 사용자만 접근할 수 있는 설정 화면입니다. 이후 프로필 수정 API와 연결하면 이 영역에서 사용자 정보를 관리합니다."
        >
          <section className="protected-panel settings-placeholder">
            <div className="settings-placeholder-item">
              <p className="summary-label">Access</p>
              <p>Authenticated session required</p>
            </div>
            <div className="settings-placeholder-item">
              <p className="summary-label">Next step</p>
              <p>Connect updateCurrentUser</p>
            </div>
          </section>
        </ProtectedPageShell>
      </RequireAuth>
    </Suspense>
  );
}
