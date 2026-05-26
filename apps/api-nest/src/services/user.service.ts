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
import { AddUserDto } from '../dto/user/add-user.dto';
import { LoginUserDto } from '../dto/user/login-user.dto';

const pbkdf2 = promisify(pbkdf2Callback);
const passwordHashPrefix = 'pbkdf2_sha256';

type UserResponse = Omit<User, 'password'> & {
  token?: string;
};

@Injectable()
export class UserService {
  private readonly jwtSecret = process.env.JWT_SECRET ?? 'super-secret-key';

  async getUsers() {
    const users = await prisma.user.findMany();
    return {
      users: users.map((user) => this.formatUser(user)),
    };
  }

  async createUser(addUserDto: AddUserDto) {
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
        user: this.formatUser(user, true),
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

  async login(loginDto: LoginUserDto) {
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
      user: this.formatUser(user, true),
    };
  }

  private formatUser(user: User, includeToken = false): UserResponse {
    const { password, ...responseUser } = user;

    return {
      ...responseUser,
      token: includeToken ? this.generateToken(user) : undefined,
    };
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
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    });
    const signature = createHmac('sha256', this.jwtSecret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    return `${header}.${payload}.${signature}`;
  }

  private base64UrlEncode(value: Record<string, unknown>): string {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }
}
