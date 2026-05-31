import { Module } from '@nestjs/common';
import { ArticleController } from '../controllers/article.controller';
import { AuthGuard } from '../guards/auth.guard';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';
import { ArticleService } from '../services/article.service';

@Module({
  controllers: [ArticleController],
  providers: [ArticleService, AuthGuard, OptionalAuthGuard],
})
export class ArticleModule {}
