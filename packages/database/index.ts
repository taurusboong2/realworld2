import { PrismaClient } from './client';

export * from './client'; // Prisma가 생성한 타입들을 모두 export
export const db = new PrismaClient(); // 실제 DB 인스턴스 export