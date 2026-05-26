import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@repo/database';
import { prisma } from '../clients/prisma.client';
import { CreateArticleDto } from '../dto/article/create-article.dto';
import { UpdateArticleDto } from '../dto/article/update-article.dto';

type ArticleRecord = {
  id: number;
  slug: string;
  title: string;
  description: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: number;
  author: {
    username: string;
    bio: string | null;
    image: string | null;
  };
  tagList: {
    name: string;
  }[];
};

type ArticleResponse = Omit<ArticleRecord, 'tagList' | 'author'> & {
  tagList: string[];
  favorited: boolean;
  favoritesCount: number;
  author: ArticleRecord['author'] & {
    following: boolean;
  };
};

@Injectable()
export class ArticleService {
  async getArticles() {
    const [articles, articlesCount] = await Promise.all([
      prisma.article.findMany({
        include: this.articleInclude(),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.article.count(),
    ]);

    return {
      articles: articles.map((article) => this.formatArticle(article)),
      articlesCount,
    };
  }

  async getArticleBySlug(slug: string) {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: this.articleInclude(),
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return {
      article: this.formatArticle(article),
    };
  }

  async createArticle(dto: CreateArticleDto, authorIdParam: string) {
    const { article: articleDto } = dto;
    const authorId = this.parseAuthorId(authorIdParam);
    const slug = this.createUniqueSlug(articleDto.title);

    try {
      const article = await prisma.article.create({
        data: {
          title: articleDto.title,
          description: articleDto.description,
          body: articleDto.body,
          slug,
          author: {
            connect: { id: authorId },
          },
          tagList: {
            connectOrCreate: this.toTagConnectOrCreate(articleDto.tagList),
          },
        },
        include: this.articleInclude(),
      });

      return {
        article: this.formatArticle(article),
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async updateArticle(slug: string, dto: UpdateArticleDto) {
    const { article: updateDto } = dto;
    const article = await prisma.article.findUnique({
      where: { slug },
      include: this.articleInclude(),
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const updated = await prisma.article.update({
      where: { id: article.id },
      data: {
        title: updateDto.title ?? article.title,
        description: updateDto.description ?? article.description,
        body: updateDto.body ?? article.body,
        slug: updateDto.title
          ? this.createUniqueSlug(updateDto.title)
          : article.slug,
      },
      include: this.articleInclude(),
    });

    return {
      article: this.formatArticle(updated),
    };
  }

  async deleteArticle(slug: string) {
    const article = await prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    await prisma.article.delete({
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

  private formatArticle(article: ArticleRecord): ArticleResponse {
    const { tagList, author, ...articleFields } = article;

    return {
      ...articleFields,
      tagList: tagList.map((tag) => tag.name),
      favorited: false,
      favoritesCount: 0,
      author: {
        ...author,
        following: false,
      },
    };
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
