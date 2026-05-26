import {
  Body,
  Controller,
  Delete,
  Get,
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
  getArticles() {
    return this.articleService.getArticles();
  }

  @Get(':slug')
  getArticleBySlug(@Param('slug') slug: string) {
    return this.articleService.getArticleBySlug(slug);
  }

  @Post()
  createArticle(
    @Body() dto: CreateArticleDto,
    @Query('authorId') authorId: string,
  ) {
    return this.articleService.createArticle(dto, authorId);
  }

  @Put(':slug')
  updateArticle(@Param('slug') slug: string, @Body() dto: UpdateArticleDto) {
    return this.articleService.updateArticle(slug, dto);
  }

  @Delete(':slug')
  deleteArticle(@Param('slug') slug: string) {
    return this.articleService.deleteArticle(slug);
  }
}
