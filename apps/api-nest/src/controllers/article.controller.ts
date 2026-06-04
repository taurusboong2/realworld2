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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ArticleService } from '../services/article.service';
import { CreateArticleDto } from '../dto/article/create-article.dto';
import { UpdateArticleDto } from '../dto/article/update-article.dto';
import { AuthGuard } from '../guards/auth.guard';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';
import type {
  AuthenticatedRequest,
  OptionalAuthenticatedRequest,
} from '../types/auth';

@Controller('/api/articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('/')
  @UseGuards(OptionalAuthGuard)
  getArticles(
    @Query()
    query: {
      tag?: string;
      author?: string;
      favorited?: string;
      limit?: string;
      offset?: string;
    },
    @Req() req: OptionalAuthenticatedRequest,
  ) {
    return this.articleService.getArticles(query, req.user?.id);
  }

  @Get('/feed')
  @UseGuards(AuthGuard)
  getFeed(@Req() req: AuthenticatedRequest) {
    return this.articleService.getFeed(req.user.id);
  }

  @Get('/:slug')
  @UseGuards(OptionalAuthGuard)
  getArticleBySlug(
    @Param('slug') slug: string,
    @Req() req: OptionalAuthenticatedRequest,
  ) {
    return this.articleService.getArticleBySlug(slug, req.user?.id);
  }

  @Post('/')
  @UseGuards(AuthGuard)
  createArticle(@Body() dto: CreateArticleDto, @Req() req: AuthenticatedRequest) {
    return this.articleService.createArticle(dto, req.user.id);
  }

  @Put('/:slug')
  @UseGuards(AuthGuard)
  updateArticle(
    @Param('slug') slug: string,
    @Body() dto: UpdateArticleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.articleService.updateArticle(slug, dto, req.user.id);
  }

  @Delete('/:slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  deleteArticle(@Param('slug') slug: string, @Req() req: AuthenticatedRequest) {
    return this.articleService.deleteArticle(slug, req.user.id);
  }

  @Post('/:slug/favorite')
  @UseGuards(AuthGuard)
  favoriteArticle(
    @Param('slug') slug: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.articleService.favoriteArticle(slug, req.user.id);
  }

  @Delete('/:slug/favorite')
  @UseGuards(AuthGuard)
  unfavoriteArticle(
    @Param('slug') slug: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.articleService.unfavoriteArticle(slug, req.user.id);
  }
}
