import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AddUserDto } from '../dto/user/add-user.dto';
import { LoginUserDto } from '../dto/user/login-user.dto';
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
  login(@Body() loginDto: LoginUserDto) {
    return this.userService.login(loginDto);
  }
}
