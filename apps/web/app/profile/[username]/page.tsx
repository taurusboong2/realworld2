'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ProfileFollowButton } from '@/components/profile-follow-button';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { getProfile } from '@/lib/api/profiles';
import type { Profile } from '@/lib/api/types';

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const profileInitial = useMemo(() => {
    return profile?.username.slice(0, 1).toUpperCase() ?? '?';
  }, [profile?.username]);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { profile: loadedProfile } = await getProfile(username);

        if (isActive) {
          setProfile(loadedProfile);
        }
      } catch (loadError) {
        if (isActive) {
          setError(getApiErrorMessage(loadError, '프로필을 불러오지 못했습니다.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [username]);

  return (
    <main className="profile-page">
      <section className="profile-shell">
        {isLoading ? (
          <div className="profile-card profile-card-main">
            <div className="profile-identity">
              <div className="profile-skeleton profile-skeleton-avatar" />
              <div className="profile-copy">
                <div className="profile-skeleton profile-skeleton-title" />
                <div className="profile-skeleton profile-skeleton-copy" />
              </div>
            </div>
          </div>
        ) : null}

        {!isLoading && error ? <p className="profile-error">{error}</p> : null}

        {!isLoading && profile ? (
          <div className="profile-card profile-card-main">
            <div className="profile-identity">
              {profile.image ? (
                <Image
                  src={profile.image}
                  alt=""
                  width={96}
                  height={96}
                  unoptimized
                  className="profile-avatar-image"
                />
              ) : (
                <div className="profile-avatar-fallback">{profileInitial}</div>
              )}

              <div className="profile-copy">
                <p className="eyebrow">Profile</p>
                <h1>{profile.username}</h1>
                <p>{profile.bio || 'No bio yet.'}</p>
              </div>
            </div>

            <ProfileFollowButton
              username={profile.username}
              initialFollowing={profile.following}
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}
