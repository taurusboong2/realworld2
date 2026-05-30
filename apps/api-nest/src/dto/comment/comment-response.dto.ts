export type CommentWithAuthor = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  author: {
    username: string;
    bio: string | null;
    image: string | null;
    followedBy?: { id: number }[];
  };
};

export class CommentAuthorResponseDto {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;

  static fromModel(
    author: CommentWithAuthor['author'],
    currentUserId?: number,
  ): CommentAuthorResponseDto {
    return {
      username: author.username,
      bio: author.bio,
      image: author.image,
      following: currentUserId ? (author.followedBy?.length ?? 0) > 0 : false,
    };
  }
}

export class CommentResponseDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  author: CommentAuthorResponseDto;

  static fromModel(
    comment: CommentWithAuthor,
    currentUserId?: number,
  ): CommentResponseDto {
    return {
      id: comment.id,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      body: comment.body,
      author: CommentAuthorResponseDto.fromModel(
        comment.author,
        currentUserId,
      ),
    };
  }
}
