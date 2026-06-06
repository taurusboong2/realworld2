import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  createHmac,
  pbkdf2 as pbkdf2Callback,
  randomBytes,
  timingSafeEqual,
} from 'crypto';
import { promisify } from 'util';
import { Prisma, User } from '@repo/database';
import { prisma } from '../clients/prisma.client';
import { env } from '../constants/env';
import { AddUserDto } from '../dto/user/add-user.dto';
import { LoginUserDto } from '../dto/user/login-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { UserResponseDto } from '../dto/user/user-response.dto';

const pbkdf2 = promisify(pbkdf2Callback);
const passwordHashPrefix = 'pbkdf2_sha256';

type AuthResult = {
  user: UserResponseDto;
  accessToken: string;
};

@Injectable()
export class UserService {
  async getUsers() {
    const users = await prisma.user.findMany();
    return {
      users: users.map((user) => UserResponseDto.fromModel(user)),
    };
  }

  async createUser(addUserDto: AddUserDto): Promise<AuthResult> {
    const { user: details } = addUserDto;

    try {
      const user = await prisma.user.create({
        data: {
          username: details.username,
          email: details.email,
          password: await this.hashPassword(details.password),
        },
      });

      return {
        user: UserResponseDto.fromModel(user),
        accessToken: this.generateToken(user),
      };
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

  async login(loginDto: LoginUserDto): Promise<AuthResult> {
    const { user: details } = loginDto;
    const user = await prisma.user.findUnique({
      where: {
        email: details.email,
      },
    });

    if (!user || !(await this.verifyPassword(details.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      user: UserResponseDto.fromModel(user),
      accessToken: this.generateToken(user),
    };
  }

  async getCurrentUser(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: UserResponseDto.fromModel(user),
    };
  }

  async updateUser(id: number, updateDto: UpdateUserDto) {
    const { user: details } = updateDto;

    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          username: details.username,
          email: details.email,
          bio: details.bio,
          image: details.image,
          password: details.password
            ? await this.hashPassword(details.password)
            : undefined,
        },
      });

      return {
        user: UserResponseDto.fromModel(user),
      };
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

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const hash = await pbkdf2(password, salt, 100_000, 32, 'sha256');
    return `${passwordHashPrefix}$100000$${salt}$${hash.toString('hex')}`;
  }

  private async verifyPassword(
    password: string,
    storedPassword: string,
  ): Promise<boolean> {
    const [algorithm, iterations, salt, storedHash] = storedPassword.split('$');

    if (
      algorithm !== passwordHashPrefix ||
      !iterations ||
      !salt ||
      !storedHash
    ) {
      return password === storedPassword;
    }

    const hash = await pbkdf2(
      password,
      salt,
      Number(iterations),
      Buffer.from(storedHash, 'hex').length,
      'sha256',
    );
    const storedHashBuffer = Buffer.from(storedHash, 'hex');

    return (
      hash.length === storedHashBuffer.length &&
      timingSafeEqual(hash, storedHashBuffer)
    );
  }

  private generateToken(user: User): string {
    const header = this.base64UrlEncode({
      alg: 'HS256',
      typ: 'JWT',
    });
    const payload = this.base64UrlEncode({
      sub: user.id,
      email: user.email,
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + env.jwtExpiresInSeconds,
    });
    const signature = createHmac('sha256', env.jwtSecret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    return `${header}.${payload}.${signature}`;
  }

  private base64UrlEncode(value: Record<string, unknown>): string {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }
}
