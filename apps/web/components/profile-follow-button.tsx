'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { followProfile, unfollowProfile } from '@/lib/api/profiles';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { getLoginHref } from '@/lib/auth/redirect';
import { useAuth } from '@/lib/auth/use-auth';

type ProfileFollowButtonProps = {
  username: string;
  initialFollowing: boolean;
};

export const ProfileFollowButton = ({
  username,
  initialFollowing,
}: ProfileFollowButtonProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status, user, refreshUser } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryString = searchParams.toString();
  const redirectTo = queryString ? `${pathname}?${queryString}` : pathname;

  if (status === 'authenticated' && user?.username === username) {
    return (
      <Link href="/settings" className="profile-action-secondary">
        Edit Profile
      </Link>
    );
  }

  if (status === 'loading') {
    return (
      <button type="button" className="profile-action-secondary" disabled>
        Loading
      </button>
    );
  }

  if (status !== 'authenticated') {
    return (
      <Link
        href={getLoginHref(redirectTo)}
        className="profile-action-primary"
      >
        Login to Follow
      </Link>
    );
  }

  const handleToggleFollow = async () => {
    setIsPending(true);
    setError(null);

    try {
      const { profile } = following
        ? await unfollowProfile(username)
        : await followProfile(username);

      setFollowing(profile.following);
    } catch (followError) {
      if (followError instanceof ApiError && followError.status === 401) {
        await refreshUser();
        router.push(getLoginHref(redirectTo));
        return;
      }

      setError(getApiErrorMessage(followError));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="profile-follow-control">
      <button
        type="button"
        className={`profile-follow-button${following ? ' is-following' : ''}`}
        disabled={isPending}
        onClick={handleToggleFollow}
      >
        {isPending
          ? 'Saving...'
          : following
            ? 'Unfollow'
            : `Follow ${username}`}
      </button>
      {error ? <p className="profile-action-error">{error}</p> : null}
    </div>
  );
};
