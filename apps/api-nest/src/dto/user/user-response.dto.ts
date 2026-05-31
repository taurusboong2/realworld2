import type { User } from '@repo/database';

export class UserResponseDto {
  id: number;
  email: string;
  username: string;
  bio: string | null;
  image: string | null;

  static fromModel(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      bio: user.bio,
      image: user.image,
    };
  }
}
