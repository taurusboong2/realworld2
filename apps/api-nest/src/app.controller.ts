import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('users') // 호출 주소를 /users로 변경합니다.
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getUsers() {
    return await this.appService.getUsers();
  }
}
