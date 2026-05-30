import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AddUserDto } from '../dto/user/add-user.dto';
import { LoginUserDto } from '../dto/user/login-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { UserService } from '../services/user.service';

@Controller('/api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('users')
  getUsers() {
    return this.userService.getUsers();
  }

  @Post('users')
  createUser(@Body() addUserDto: AddUserDto) {
    return this.userService.createUser(addUserDto);
  }

  @Post('users/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, accessToken } = await this.userService.login(loginDto);
    const authCookieName =
      process.env.AUTH_COOKIE_NAME ?? 'realworld_auth_token';

    response.cookie(authCookieName, accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    return { user };
  }

  @Get('user')
  getCurrentUser(@Query('userId') userId: string) {
    return this.userService.getCurrentUser(parseInt(userId, 10));
  }

  @Put('user')
  updateUser(
    @Query('userId') userId: string,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(parseInt(userId, 10), updateDto);
  }
}
