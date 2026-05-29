import { Injectable } from '@nestjs/common';
import { prisma } from '../clients/prisma.client';

@Injectable()
export class TagService {
  async findAll() {
    const tags = await prisma.tag.findMany({
      select: {
        name: true,
      },
    });

    // 태그 이름만 추출하여 배열로 반환
    return {
      tags: tags.map((tag) => tag.name),
    };
  }
}
