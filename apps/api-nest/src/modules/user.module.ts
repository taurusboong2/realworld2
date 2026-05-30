import { Module } from '@nestjs/common';
import { UserController } from '../controllers/user.controller';
import { AuthGuard } from '../guards/auth.guard';
import { UserService } from '../services/user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, AuthGuard],
})
export class UserModule {}
