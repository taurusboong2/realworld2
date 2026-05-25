import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@repo/database';
import { prisma } from '../clients/prisma.client';
import { AddUserDto } from '../dto/user/add-user.dto';

@Injectable()
export class UserService {
  async getUsers() {
    return await prisma.user.findMany();
  }

  async createUser(addUserDto: AddUserDto) {
    try {
      return await prisma.user.create({
        data: addUserDto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('username or email already exists');
      }

      throw error;
    }
  }
}
