import { Injectable } from '@nestjs/common';
import { db } from '@repo/database';

@Injectable()
export class AppService {
  async getUsers() {
    return await db.user.findMany();
  }
}
