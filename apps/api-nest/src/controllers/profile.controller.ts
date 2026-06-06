import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { AuthGuard } from '../guards/auth.guard';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';
import type {
  AuthenticatedRequest,
  OptionalAuthenticatedRequest,
} from '../types/auth';

@Controller('/api/profiles/:username')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('/')
  @UseGuards(OptionalAuthGuard)
  getProfile(
    @Param('username') username: string,
    @Req() req: OptionalAuthenticatedRequest,
  ) {
    return this.profileService.getProfile(username, req.user?.id);
  }

  @Post('/follow')
  @UseGuards(AuthGuard)
  followUser(
    @Param('username') username: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.profileService.followUser(username, req.user.id);
  }

  @Delete('/follow')
  @UseGuards(AuthGuard)
  unfollowUser(
    @Param('username') username: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.profileService.unfollowUser(username, req.user.id);
  }
}
