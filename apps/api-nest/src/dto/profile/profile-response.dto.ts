export type ProfileUser = {
  username: string;
  bio: string | null;
  image: string | null;
};

export class ProfileResponseDto {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;

  static fromModel(user: ProfileUser, following: boolean): ProfileResponseDto {
    return {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following,
    };
  }
}
