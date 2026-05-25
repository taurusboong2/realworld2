import { Injectable } from '@nestjs/common';
import { db } from '@repo/database'; // packages/database에서 가져옵니다.

@Injectable()
export class AppService {
  async getUsers() {
    return await db.user.findMany(); // Prisma를 통해 유저 목록을 조회합니다.
  }
}
