import { Module } from '@nestjs/common';
import { CommentController } from '../controllers/comment.controller';
import { AuthGuard } from '../guards/auth.guard';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';
import { CommentService } from '../services/comment.service';

@Module({
  controllers: [CommentController],
  providers: [CommentService, AuthGuard, OptionalAuthGuard],
})
export class CommentModule {}
