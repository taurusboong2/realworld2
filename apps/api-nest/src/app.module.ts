import { Module } from '@nestjs/common';
import { DefaultModule } from './modules/default.module';
import { UserModule } from './modules/user.module';
import { ArticleModule } from './modules/article.module';
import { TagModule } from './modules/tag.module';
import { CommentModule } from './modules/comment.module';
import { ProfileModule } from './modules/profile.module';

@Module({
  imports: [
    DefaultModule,
    UserModule,
    ArticleModule,
    TagModule,
    CommentModule,
    ProfileModule,
  ],
})
export class AppModule {}
