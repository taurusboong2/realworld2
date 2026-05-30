import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '../clients/prisma.client';
import { AddCommentDto } from '../dto/comment/add-comment.dto';
import { CommentResponseDto } from '../dto/comment/comment-response.dto';

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

    return { comment: CommentResponseDto.fromModel(comment, userId) };
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
        CommentResponseDto.fromModel(comment, currentUserId),
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
}
