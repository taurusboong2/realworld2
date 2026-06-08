import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '../clients/prisma.client';
import { ProfileResponseDto } from '../dto/profile/profile-response.dto';

@Injectable()
export class ProfileService {
  async getProfile(username: string, currentUserId?: number) {
    const parsedCurrentUserId = currentUserId
      ? this.parseCurrentUserId(currentUserId)
      : undefined;
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        followedBy: parsedCurrentUserId
          ? { where: { id: parsedCurrentUserId } }
          : false,
      },
    });

    if (!user) {
      throw new NotFoundException('Profile not found');
    }

    return {
      profile: ProfileResponseDto.fromModel(
        user,
        parsedCurrentUserId ? user.followedBy.length > 0 : false,
      ),
    };
  }

  async followUser(username: string, currentUserId: number) {
    const parsedCurrentUserId = this.parseCurrentUserId(currentUserId);
    const userToFollow = await prisma.user.findUnique({
      where: { username },
    });

    if (!userToFollow) {
      throw new NotFoundException('Profile not found');
    }

    await prisma.user.update({
      where: { id: parsedCurrentUserId },
      data: {
        following: {
          connect: { id: userToFollow.id },
        },
      },
    });

    return {
      profile: ProfileResponseDto.fromModel(userToFollow, true),
    };
  }

  async unfollowUser(username: string, currentUserId: number) {
    const parsedCurrentUserId = this.parseCurrentUserId(currentUserId);
    const userToUnfollow = await prisma.user.findUnique({
      where: { username },
    });

    if (!userToUnfollow) {
      throw new NotFoundException('Profile not found');
    }

    await prisma.user.update({
      where: { id: parsedCurrentUserId },
      data: {
        following: {
          disconnect: { id: userToUnfollow.id },
        },
      },
    });

    return {
      profile: ProfileResponseDto.fromModel(userToUnfollow, false),
    };
  }

  private parseCurrentUserId(currentUserId: number) {
    if (!Number.isInteger(currentUserId) || currentUserId <= 0) {
      throw new BadRequestException('current user id is required');
    }

    return currentUserId;
  }
}
