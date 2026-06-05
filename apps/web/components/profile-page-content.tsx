'use client';

import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArticleCard } from '@/components/article-card';
import { ProfileFollowButton } from '@/components/profile-follow-button';
import { getArticles } from '@/lib/api/articles';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { getProfile } from '@/lib/api/profiles';
import type { Article, Profile } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/use-auth';

const pageSize = 10;

type ProfileArticleTab = 'author' | 'favorited';

type ProfilePageContentProps = {
  username: string;
};

const parsePage = (value: string | null) => {
  if (!value) {
    return 1;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
};

const parseTab = (value: string | null): ProfileArticleTab => {
  return value === 'favorited' ? 'favorited' : 'author';
};

function ProfileSkeleton() {
  return (
    <div className="profile-card profile-card-main">
      <div className="profile-identity">
        <div className="profile-skeleton profile-skeleton-avatar" />
        <div className="profile-copy">
          <div className="profile-skeleton profile-skeleton-title" />
          <div className="profile-skeleton profile-skeleton-copy" />
        </div>
      </div>
    </div>
  );
}

function ArticleListSkeleton() {
  return (
    <div className="article-list">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="profile-article-skeleton" />
      ))}
    </div>
  );
}

function ProfileTabs({
  activeTab,
  onChange,
  disabled,
}: {
  activeTab: ProfileArticleTab;
  onChange: (tab: ProfileArticleTab) => void;
  disabled: boolean;
}) {
  const tabs: Array<{ value: ProfileArticleTab; label: string }> = [
    { value: 'author', label: '작성 글' },
    { value: 'favorited', label: '좋아요한 글' },
  ];

  return (
    <div className="profile-tabs">
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;

        return (
          <button
            key={tab.value}
            type="button"
            className={isActive ? 'profile-tab is-active' : 'profile-tab'}
            disabled={disabled}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyArticles({ activeTab }: { activeTab: ProfileArticleTab }) {
  return (
    <div className="article-empty">
      <p>
        {activeTab === 'author'
          ? '작성한 게시글이 없습니다.'
          : '좋아요한 게시글이 없습니다.'}
      </p>
      <p>
        {activeTab === 'author'
          ? '게시글을 작성하면 이 탭에 표시됩니다.'
          : '게시글에 좋아요를 누르면 이 탭에 표시됩니다.'}
      </p>
    </div>
  );
}

export function ProfilePageContent({ username }: ProfilePageContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status } = useAuth();
  const activeTab = parseTab(searchParams.get('tab'));
  const currentPage = parsePage(searchParams.get('page'));
  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesCount, setArticlesCount] = useState(0);
  const [profileErrorMessage, setProfileErrorMessage] = useState<string | null>(
    null,
  );
  const [articlesErrorMessage, setArticlesErrorMessage] = useState<
    string | null
  >(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isArticlesLoading, setIsArticlesLoading] = useState(true);
  const totalPages = Math.max(1, Math.ceil(articlesCount / pageSize));

  const activeTitle = useMemo(() => {
    return activeTab === 'author' ? '작성 글' : '좋아요한 글';
  }, [activeTab]);

  const profileInitial = useMemo(() => {
    return profile?.username.slice(0, 1).toUpperCase() ?? '?';
  }, [profile?.username]);

  const updateRoute = (nextTab: ProfileArticleTab, nextPage: number) => {
    const params = new URLSearchParams();

    if (nextTab === 'favorited') {
      params.set('tab', nextTab);
    }

    if (nextPage > 1) {
      params.set('page', String(nextPage));
    }

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
  };

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      setIsProfileLoading(true);
      setProfileErrorMessage(null);

      try {
        const { profile: loadedProfile } = await getProfile(username);

        if (!isActive) {
          return;
        }

        setProfile(loadedProfile);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setProfileErrorMessage(
          getApiErrorMessage(error, '프로필을 불러오지 못했습니다.'),
        );
      } finally {
        if (isActive) {
          setIsProfileLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [username]);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    let isActive = true;

    const loadArticles = async () => {
      setIsArticlesLoading(true);
      setArticlesErrorMessage(null);

      try {
        const response = await getArticles({
          limit: pageSize,
          offset: (currentPage - 1) * pageSize,
          ...(activeTab === 'author'
            ? { author: username }
            : { favorited: username }),
        });

        if (!isActive) {
          return;
        }

        setArticles(response.articles);
        setArticlesCount(response.articlesCount);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setArticlesErrorMessage(
          getApiErrorMessage(error, '게시글을 불러오지 못했습니다.'),
        );
      } finally {
        if (isActive) {
          setIsArticlesLoading(false);
        }
      }
    };

    void loadArticles();

    return () => {
      isActive = false;
    };
  }, [activeTab, currentPage, status, username]);

  return (
    <main className="profile-page">
      <section className="profile-shell">
        {isProfileLoading ? <ProfileSkeleton /> : null}

        {!isProfileLoading && profileErrorMessage ? (
          <p className="profile-error">{profileErrorMessage}</p>
        ) : null}

        {!isProfileLoading && profile ? (
          <>
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
                  <div className="profile-avatar-fallback">
                    {profileInitial}
                  </div>
                )}

                <div className="profile-copy">
                  <p className="eyebrow">Profile</p>
                  <h1>{profile.username}</h1>
                  <p>{profile.bio || '작성된 소개가 없습니다.'}</p>
                </div>
              </div>

              <ProfileFollowButton
                username={profile.username}
                initialFollowing={profile.following}
              />
            </div>

            <section className="profile-articles">
              <div className="profile-articles-head">
                <div>
                  <p className="eyebrow">Articles</p>
                  <h2>{activeTitle}</h2>
                </div>
                <p>총 {articlesCount}개</p>
              </div>

              <ProfileTabs
                activeTab={activeTab}
                onChange={(nextTab) => updateRoute(nextTab, 1)}
                disabled={isArticlesLoading || status === 'loading'}
              />

              {articlesErrorMessage ? (
                <p role="alert" className="form-error">
                  {articlesErrorMessage}
                </p>
              ) : null}

              {isArticlesLoading || status === 'loading' ? (
                <ArticleListSkeleton />
              ) : articles.length > 0 ? (
                <div className="article-list">
                  {articles.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              ) : (
                <EmptyArticles activeTab={activeTab} />
              )}

              <div className="profile-articles-footer">
                <p>
                  {currentPage} / {totalPages}
                </p>
                <div className="profile-pager">
                  <button
                    type="button"
                    disabled={currentPage <= 1 || isArticlesLoading}
                    onClick={() =>
                      updateRoute(activeTab, Math.max(1, currentPage - 1))
                    }
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages || isArticlesLoading}
                    onClick={() =>
                      updateRoute(
                        activeTab,
                        Math.min(totalPages, currentPage + 1),
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}
