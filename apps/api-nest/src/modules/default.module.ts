import { Module } from '@nestjs/common';
import { DefaultController } from '../controllers/default.controller';
import { DefaultService } from '../services/default.service';

@Module({
  controllers: [DefaultController],
  providers: [DefaultService],
})
export class DefaultModule {}
