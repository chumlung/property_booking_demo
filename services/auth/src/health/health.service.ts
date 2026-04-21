import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkDatabaseReadiness(): Promise<boolean> {
    try {
      await this.prisma.user.findMany({
        take: 1,
        select: {
          id: true,
        },
      });
      return true;
    } catch {
      return false;
    }
  }
}
