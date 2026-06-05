import { Suspense } from 'react';
import { ProtectedPageShell } from '@/components/protected-page-shell';
import { RequireAuth } from '@/components/require-auth';
import { SettingsProfileForm } from '@/components/settings-profile-form';

export default function SettingsPage() {
  return (
    <Suspense>
      <RequireAuth>
        <ProtectedPageShell
          eyebrow="Account"
          title="프로필과 계정 설정"
          description="프로필 공개 정보와 계정 정보를 수정합니다."
        >
          <SettingsProfileForm />
        </ProtectedPageShell>
      </RequireAuth>
    </Suspense>
  );
}
