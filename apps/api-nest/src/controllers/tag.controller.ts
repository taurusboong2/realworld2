import { Controller, Get } from '@nestjs/common';
import { TagService } from '../services/tag.service';

@Controller('/api/tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get('/')
  async getTags() {
    return this.tagService.findAll();
  }
}
