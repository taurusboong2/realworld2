import {
  BadRequestException,
  ForbiddenException,
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
    followedBy?: { id: number }[];
  };
  tagList: {
    name: string;
  }[];
  favoritedBy?: { id: number }[];
  _count?: {
    favoritedBy: number;
  };
};

type ArticleResponse = Omit<
  ArticleRecord,
  'tagList' | 'author' | 'favoritedBy' | '_count'
> & {
  tagList: string[];
  favorited: boolean;
  favoritesCount: number;
  author: Pick<ArticleRecord['author'], 'username' | 'bio' | 'image'> & {
    following: boolean;
  };
};

@Injectable()
export class ArticleService {
  async getArticles(
    query: { tag?: string; author?: string; favorited?: string } = {},
    userId?: number,
  ) {
    const where: Prisma.ArticleWhereInput = {};

    if (query.tag) {
      where.tagList = { some: { name: query.tag } };
    }

    if (query.author) {
      where.author = { username: query.author };
    }

    if (query.favorited) {
      where.favoritedBy = { some: { username: query.favorited } };
    }

    const [articles, articlesCount] = await Promise.all([
      prisma.article.findMany({
        where,
        include: this.articleInclude(userId),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.article.count({ where }),
    ]);

    return {
      articles: articles.map((article) => this.formatArticle(article, userId)),
      articlesCount,
    };
  }

  async getFeed(userId: number) {
    const parsedUserId = this.parseUserId(userId);
    const user = await prisma.user.findUnique({
      where: { id: parsedUserId },
      include: {
        following: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const followingIds = user.following.map((following) => following.id);
    const where: Prisma.ArticleWhereInput = {
      authorId: { in: followingIds },
    };

    const [articles, articlesCount] = await Promise.all([
      prisma.article.findMany({
        where,
        include: this.articleInclude(parsedUserId),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.article.count({ where }),
    ]);

    return {
      articles: articles.map((article) =>
        this.formatArticle(article, parsedUserId),
      ),
      articlesCount,
    };
  }

  async getArticleBySlug(slug: string, userId?: number) {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: this.articleInclude(userId),
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return {
      article: this.formatArticle(article, userId),
    };
  }

  async createArticle(dto: CreateArticleDto, userId: number) {
    const { article: articleDto } = dto;
    const authorId = this.parseUserId(userId);
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
        include: this.articleInclude(authorId),
      });

      return {
        article: this.formatArticle(article, authorId),
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async favoriteArticle(slug: string, userId: number) {
    const parsedUserId = this.parseUserId(userId);

    try {
      const article = await prisma.article.update({
        where: { slug },
        data: {
          favoritedBy: {
            connect: { id: parsedUserId },
          },
        },
        include: this.articleInclude(parsedUserId),
      });

      return {
        article: this.formatArticle(article, parsedUserId),
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async unfavoriteArticle(slug: string, userId: number) {
    const parsedUserId = this.parseUserId(userId);

    try {
      const article = await prisma.article.update({
        where: { slug },
        data: {
          favoritedBy: {
            disconnect: { id: parsedUserId },
          },
        },
        include: this.articleInclude(parsedUserId),
      });

      return {
        article: this.formatArticle(article, parsedUserId),
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async updateArticle(slug: string, dto: UpdateArticleDto, userId: number) {
    const { article: updateDto } = dto;
    const parsedUserId = this.parseUserId(userId);
    const article = await prisma.article.findUnique({
      where: { slug },
      select: {
        id: true,
        authorId: true,
        slug: true,
        title: true,
        description: true,
        body: true,
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== parsedUserId) {
      throw new ForbiddenException('You can only update your own articles');
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
      include: this.articleInclude(parsedUserId),
    });

    return {
      article: this.formatArticle(updated, parsedUserId),
    };
  }

  async deleteArticle(slug: string, userId: number) {
    const parsedUserId = this.parseUserId(userId);
    const article = await prisma.article.findUnique({
      where: { slug },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== parsedUserId) {
      throw new ForbiddenException('You can only delete your own articles');
    }

    await prisma.article.delete({
      where: { id: article.id },
    });
  }

  private articleInclude(userId?: number) {
    return {
      author: {
        include: {
          followedBy: userId ? { where: { id: userId } } : false,
        },
      },
      tagList: true,
      favoritedBy: userId ? { where: { id: userId } } : false,
      _count: { select: { favoritedBy: true } },
    } as const;
  }

  private formatArticle(article: ArticleRecord, userId?: number): ArticleResponse {
    const { tagList, author, favoritedBy = [], _count, ...articleFields } =
      article;

    return {
      ...articleFields,
      tagList: tagList.map((tag) => tag.name),
      favorited: userId ? favoritedBy.length > 0 : false,
      favoritesCount: _count?.favoritedBy ?? 0,
      author: {
        username: author.username,
        bio: author.bio,
        image: author.image,
        following: userId ? (author.followedBy?.length ?? 0) > 0 : false,
      },
    };
  }

  private parseUserId(userId: number) {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestException('userId query parameter is required');
    }

    return userId;
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
      throw new NotFoundException('Related resource not found');
    }

    throw error;
  }
}
