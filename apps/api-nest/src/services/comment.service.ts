import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '../clients/prisma.client';
import { AddCommentDto } from '../dto/comment/AddComment.dto';

@Injectable()
export class CommentService {
  async createComment(slug: string, userId: number, dto: AddCommentDto) {
    const article = await prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const comment = await prisma.comment.create({
      data: {
        body: dto.comment.body,
        author: { connect: { id: userId } },
        article: { connect: { id: article.id } },
      },
      include: {
        author: {
          include: {
            followedBy: { where: { id: userId } },
          },
        },
      },
    });

    return { comment: this.formatComment(comment, userId) };
  }

  async getComments(slug: string, currentUserId?: number) {
    const article = await prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const comments = await prisma.comment.findMany({
      where: { articleId: article.id },
      include: {
        author: {
          include: {
            followedBy: currentUserId
              ? { where: { id: currentUserId } }
              : false,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      comments: comments.map((comment) =>
        this.formatComment(comment, currentUserId),
      ),
    };
  }

  async deleteComment(slug: string, userId: number, commentId: number) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        article: {
          select: { slug: true },
        },
      },
    });

    if (!comment || comment.article.slug !== slug) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });
  }

  private formatComment(
    comment: {
      id: number;
      createdAt: Date;
      updatedAt: Date;
      body: string;
      author: {
        username: string;
        bio: string | null;
        image: string | null;
        followedBy?: { id: number }[];
      };
    },
    currentUserId?: number,
  ) {
    return {
      id: comment.id,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      body: comment.body,
      author: {
        username: comment.author.username,
        bio: comment.author.bio,
        image: comment.author.image,
        following: currentUserId
          ? (comment.author.followedBy?.length ?? 0) > 0
          : false,
      },
    };
  }
}
