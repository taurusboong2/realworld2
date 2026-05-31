export type User = {
  id: number;
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
};

export type Profile = {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
};

export type Tag = string;

export type Article = {
  slug: string;
  title: string;
  description: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  tagList: Tag[];
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
};

export type Comment = {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: Profile;
};

export type AuthResponse = {
  user: User;
};

export type UsersResponse = {
  users: User[];
};

export type ProfileResponse = {
  profile: Profile;
};

export type ArticleResponse = {
  article: Article;
};

export type ArticleListResponse = {
  articles: Article[];
  articlesCount: number;
};

export type CommentResponse = {
  comment: Comment;
};

export type CommentListResponse = {
  comments: Comment[];
};

export type TagListResponse = {
  tags: Tag[];
};
