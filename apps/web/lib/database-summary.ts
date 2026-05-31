import { db, sqliteUrl } from '@repo/database';

export type DatabaseSummary = {
  sqliteUrl: string;
  counts: {
    users: number;
    articles: number;
    comments: number;
    tags: number;
  };
};

export async function getDatabaseSummary(): Promise<DatabaseSummary> {
  const [users, articles, comments, tags] = await Promise.all([
    db.user.count(),
    db.article.count(),
    db.comment.count(),
    db.tag.count(),
  ]);

  return {
    sqliteUrl,
    counts: {
      users,
      articles,
      comments,
      tags,
    },
  };
}
