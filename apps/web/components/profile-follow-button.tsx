'use client';

import Link from 'next/link';
import { useState } from 'react';
import { followProfile, unfollowProfile } from '@/lib/api/profiles';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { useAuth } from '@/lib/auth/use-auth';

type ProfileFollowButtonProps = {
  username: string;
  initialFollowing: boolean;
};

export const ProfileFollowButton = ({
  username,
  initialFollowing,
}: ProfileFollowButtonProps) => {
  const { status, user } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === 'authenticated' && user?.username === username) {
    return (
      <Link href="/settings" className="profile-action-secondary">
        Edit Profile
      </Link>
    );
  }

  if (status !== 'authenticated') {
    const redirectTo = encodeURIComponent(`/profile/${username}`);

    return (
      <Link
        href={`/login?redirectTo=${redirectTo}`}
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
