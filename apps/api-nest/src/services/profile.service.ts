import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../clients/prisma.client';

@Injectable()
export class ProfileService {
  async getProfile(username: string, currentUserId?: number) {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        followedBy: currentUserId ? { where: { id: currentUserId } } : false,
      },
    });

    if (!user) {
      throw new NotFoundException('Profile not found');
    }

    return {
      profile: {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following: currentUserId ? user.followedBy.length > 0 : false,
      },
    };
  }

  async followUser(username: string, currentUserId: number) {
    const userToFollow = await prisma.user.findUnique({
      where: { username },
    });

    if (!userToFollow) {
      throw new NotFoundException('Profile not found');
    }

    await prisma.user.update({
      where: { id: currentUserId },
      data: {
        following: {
          connect: { id: userToFollow.id },
        },
      },
    });

    return {
      profile: {
        username: userToFollow.username,
        bio: userToFollow.bio,
        image: userToFollow.image,
        following: true,
      },
    };
  }

  async unfollowUser(username: string, currentUserId: number) {
    const userToUnfollow = await prisma.user.findUnique({
      where: { username },
    });

    if (!userToUnfollow) {
      throw new NotFoundException('Profile not found');
    }

    await prisma.user.update({
      where: { id: currentUserId },
      data: {
        following: {
          disconnect: { id: userToUnfollow.id },
        },
      },
    });

    return {
      profile: {
        username: userToUnfollow.username,
        bio: userToUnfollow.bio,
        image: userToUnfollow.image,
        following: false,
      },
    };
  }
}
