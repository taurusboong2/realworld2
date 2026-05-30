import { Module } from '@nestjs/common';
import { ProfileController } from '../controllers/profile.controller';
import { AuthGuard } from '../guards/auth.guard';
import { ProfileService } from '../services/profile.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, AuthGuard],
  exports: [ProfileService],
})
export class ProfileModule {}
