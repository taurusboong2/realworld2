import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from '../services/comment.service';
import { AddCommentDto } from '../dto/comment/add-comment.dto';
import { AuthGuard } from '../guards/auth.guard';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';
import type {
  AuthenticatedRequest,
  OptionalAuthenticatedRequest,
} from '../types/auth';

@Controller('/api/articles/:slug/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/')
  @UseGuards(AuthGuard)
  createComment(
    @Param('slug') slug: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: AddCommentDto,
  ) {
    return this.commentService.createComment(slug, req.user.id, dto);
  }

  @Get('/')
  @UseGuards(OptionalAuthGuard)
  getComments(
    @Param('slug') slug: string,
    @Req() req: OptionalAuthenticatedRequest,
  ) {
    return this.commentService.getComments(slug, req.user?.id);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  deleteComment(
    @Param('slug') slug: string,
    @Param('id') commentId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentService.deleteComment(
      slug,
      req.user.id,
      parseInt(commentId, 10),
    );
  }
}
