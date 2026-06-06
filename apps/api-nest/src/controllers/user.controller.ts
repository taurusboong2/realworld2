import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { env } from '../constants/env';
import { AddUserDto } from '../dto/user/add-user.dto';
import { LoginUserDto } from '../dto/user/login-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { AuthGuard } from '../guards/auth.guard';
import { UserService } from '../services/user.service';
import type { AuthenticatedRequest } from '../types/auth';

@Controller('/api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private setAuthCookie(response: Response, accessToken: string) {
    response.cookie(env.authCookieName, accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.nodeEnv === 'production',
      maxAge: env.jwtExpiresInSeconds * 1000,
      path: '/',
    });
  }

  @Get('/users')
  getUsers() {
    return this.userService.getUsers();
  }

  @Post('/users')
  async createUser(
    @Body() addUserDto: AddUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, accessToken } = await this.userService.createUser(addUserDto);

    this.setAuthCookie(response, accessToken);

    return { user };
  }

  @Post('/users/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, accessToken } = await this.userService.login(loginDto);

    this.setAuthCookie(response, accessToken);

    return { user };
  }

  @Post('/users/logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(env.authCookieName, {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.nodeEnv === 'production',
      path: '/',
    });

    return { ok: true };
  }

  @Get('/user')
  @UseGuards(AuthGuard)
  getCurrentUser(@Req() req: AuthenticatedRequest) {
    return this.userService.getCurrentUser(req.user.id);
  }

  @Put('/user')
  @UseGuards(AuthGuard)
  updateUser(
    @Req() req: AuthenticatedRequest,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(req.user.id, updateDto);
  }
}
