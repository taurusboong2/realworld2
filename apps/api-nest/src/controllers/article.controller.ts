import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ArticleService } from '../services/article.service';
import { CreateArticleDto } from '../dto/article/create-article.dto';
import { UpdateArticleDto } from '../dto/article/update-article.dto';

@Controller('/api/articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  getArticles(
    @Query() query: { tag?: string; author?: string; favorited?: string },
    @Query('userId') userId?: string,
  ) {
    return this.articleService.getArticles(
      query,
      userId ? parseInt(userId, 10) : undefined,
    );
  }

  @Get('feed')
  getFeed(@Query('userId') userId: string) {
    return this.articleService.getFeed(parseInt(userId, 10));
  }

  @Get(':slug')
  getArticleBySlug(
    @Param('slug') slug: string,
    @Query('userId') userId?: string,
  ) {
    return this.articleService.getArticleBySlug(
      slug,
      userId ? parseInt(userId, 10) : undefined,
    );
  }

  @Post()
  createArticle(
    @Body() dto: CreateArticleDto,
    @Query('userId') userId: string,
  ) {
    return this.articleService.createArticle(dto, parseInt(userId, 10));
  }

  @Put(':slug')
  updateArticle(
    @Param('slug') slug: string,
    @Body() dto: UpdateArticleDto,
    @Query('userId') userId: string,
  ) {
    return this.articleService.updateArticle(slug, dto, parseInt(userId, 10));
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteArticle(
    @Param('slug') slug: string,
    @Query('userId') userId: string,
  ) {
    return this.articleService.deleteArticle(slug, parseInt(userId, 10));
  }

  @Post(':slug/favorite')
  favoriteArticle(
    @Param('slug') slug: string,
    @Query('userId') userId: string,
  ) {
    return this.articleService.favoriteArticle(slug, parseInt(userId, 10));
  }

  @Delete(':slug/favorite')
  unfavoriteArticle(
    @Param('slug') slug: string,
    @Query('userId') userId: string,
  ) {
    return this.articleService.unfavoriteArticle(slug, parseInt(userId, 10));
  }
}
