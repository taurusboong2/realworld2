import { Suspense } from 'react';
import { ProfilePageContent } from '@/components/profile-page-content';

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  return (
    <Suspense>
      <ProfilePageContent username={decodeURIComponent(username)} />
    </Suspense>
  );
}
