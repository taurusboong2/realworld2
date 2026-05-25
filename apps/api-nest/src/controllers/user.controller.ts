import { Body, Controller, Get, Post } from '@nestjs/common';
import { AddUserDto } from '../dto/user/add-user.dto';
import { UserService } from '../services/user.service';

@Controller('/api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers() {
    return this.userService.getUsers();
  }

  @Post()
  createUser(@Body() addUserDto: AddUserDto) {
    return this.userService.createUser(addUserDto);
  }
}
