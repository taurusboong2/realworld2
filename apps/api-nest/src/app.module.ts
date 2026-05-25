import { Module } from '@nestjs/common';
import { DefaultModule } from './modules/default.module';
import { UserModule } from './modules/user.module';

@Module({
  imports: [DefaultModule, UserModule],
})
export class AppModule {}
