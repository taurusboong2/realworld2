import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@repo/database';
import { prisma } from '../clients/prisma.client';
import { CreateArticleDto } from '../dto/article/create-article.dto';
import { UpdateArticleDto } from '../dto/article/update-article.dto';

@Injectable()
export class ArticleService {
  async getArticles() {
    return await prisma.article.findMany({
      include: this.articleInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async getArticleBySlug(slug: string) {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: this.articleInclude(),
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async createArticle(dto: CreateArticleDto, authorIdParam: string) {
    const authorId = this.parseAuthorId(authorIdParam);
    const slug = this.createUniqueSlug(dto.title);

    try {
      return await prisma.article.create({
        data: {
          title: dto.title,
          description: dto.description,
          body: dto.body,
          slug,
          author: {
            connect: { id: authorId },
          },
          tagList: {
            connectOrCreate: this.toTagConnectOrCreate(dto.tagList),
          },
        },
        include: this.articleInclude(),
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async updateArticle(slug: string, dto: UpdateArticleDto) {
    const article = await this.getArticleBySlug(slug);

    return await prisma.article.update({
      where: { id: article.id },
      data: {
        title: dto.title ?? article.title,
        description: dto.description ?? article.description,
        body: dto.body ?? article.body,
        slug: dto.title ? this.createUniqueSlug(dto.title) : article.slug,
      },
      include: this.articleInclude(),
    });
  }

  async deleteArticle(slug: string) {
    const article = await this.getArticleBySlug(slug);

    return await prisma.article.delete({
      where: { id: article.id },
    });
  }

  private articleInclude() {
    return {
      author: {
        select: {
          username: true,
          bio: true,
          image: true,
        },
      },
      tagList: true,
    } as const;
  }

  private parseAuthorId(authorId: string) {
    const parsedAuthorId = Number(authorId);

    if (!Number.isInteger(parsedAuthorId) || parsedAuthorId <= 0) {
      throw new BadRequestException('authorId query parameter is required');
    }

    return parsedAuthorId;
  }

  private toTagConnectOrCreate(tagList: string[] = []) {
    return tagList.map((tag) => ({
      where: { name: tag },
      create: { name: tag },
    }));
  }

  private createUniqueSlug(title: string) {
    return `${this.slugify(title)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private slugify(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Author not found');
    }

    throw error;
  }
}
