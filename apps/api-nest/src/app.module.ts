import { Module } from '@nestjs/common';
import { DefaultModule } from './modules/default.module';
import { UserModule } from './modules/user.module';
import { ArticleModule } from './modules/article.module';

@Module({
  imports: [DefaultModule, UserModule, ArticleModule],
})
export class AppModule {}
