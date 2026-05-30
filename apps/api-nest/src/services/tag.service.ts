import { Injectable } from '@nestjs/common';
import { prisma } from '../clients/prisma.client';
import { TagResponseDto } from '../dto/tag/tag-response.dto';

@Injectable()
export class TagService {
  async findAll() {
    const tags = await prisma.tag.findMany({
      select: {
        name: true,
      },
    });

    return TagResponseDto.fromTagNames(tags.map((tag) => tag.name));
  }
}
