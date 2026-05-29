import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CommentService } from '../services/comment.service';
import { AddCommentDto } from '../dto/comment/AddComment.dto';

@Controller('/api/articles/:slug/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  createComment(
    @Param('slug') slug: string,
    @Query('userId') userId: string,
    @Body() dto: AddCommentDto,
  ) {
    return this.commentService.createComment(slug, parseInt(userId, 10), dto);
  }

  @Get()
  getComments(
    @Param('slug') slug: string,
    @Query('userId') userId?: string,
  ) {
    return this.commentService.getComments(
      slug,
      userId ? parseInt(userId, 10) : undefined,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteComment(
    @Param('slug') slug: string,
    @Param('id') commentId: string,
    @Query('userId') userId: string,
  ) {
    return this.commentService.deleteComment(
      slug,
      parseInt(userId, 10),
      parseInt(commentId, 10),
    );
  }
}
