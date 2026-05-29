import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ProfileService } from '../services/profile.service';

@Controller('/api/profiles/:username')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(
    @Param('username') username: string,
    @Query('currentUserId') currentUserId?: string,
  ) {
    return this.profileService.getProfile(
      username,
      currentUserId ? parseInt(currentUserId, 10) : undefined,
    );
  }

  @Post('follow')
  followUser(
    @Param('username') username: string,
    @Query('currentUserId') currentUserId: string,
  ) {
    return this.profileService.followUser(username, parseInt(currentUserId, 10));
  }

  @Delete('follow')
  unfollowUser(
    @Param('username') username: string,
    @Query('currentUserId') currentUserId: string,
  ) {
    return this.profileService.unfollowUser(
      username,
      parseInt(currentUserId, 10),
    );
  }
}
