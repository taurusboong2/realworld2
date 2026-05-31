export type ArticleWithRelations = {
  slug: string;
  title: string;
  description: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    username: string;
    bio: string | null;
    image: string | null;
    followedBy?: { id: number }[];
  };
  tagList: { name: string }[];
  favoritedBy?: { id: number }[];
  _count?: {
    favoritedBy: number;
  };
};

export class ArticleAuthorResponseDto {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;

  static fromModel(
    author: ArticleWithRelations['author'],
    currentUserId?: number,
  ): ArticleAuthorResponseDto {
    return {
      username: author.username,
      bio: author.bio,
      image: author.image,
      following: currentUserId ? (author.followedBy?.length ?? 0) > 0 : false,
    };
  }
}

export class ArticleResponseDto {
  slug: string;
  title: string;
  description: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  tagList: string[];
  favorited: boolean;
  favoritesCount: number;
  author: ArticleAuthorResponseDto;

  static fromModel(
    article: ArticleWithRelations,
    currentUserId?: number,
  ): ArticleResponseDto {
    return {
      slug: article.slug,
      title: article.title,
      description: article.description,
      body: article.body,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      tagList: article.tagList.map((tag) => tag.name),
      favorited: currentUserId ? (article.favoritedBy?.length ?? 0) > 0 : false,
      favoritesCount: article._count?.favoritedBy ?? 0,
      author: ArticleAuthorResponseDto.fromModel(
        article.author,
        currentUserId,
      ),
    };
  }
}
