import { Injectable } from '@nestjs/common';
import { db } from '@repo/database'; // 여기서 에러가 안 나야 합니다.

@Injectable()
export class AppService {
  async getUsers() {
    return await db.user.findMany(); // DB에서 유저 목록을 가져오는 로직입니다.
  }
}