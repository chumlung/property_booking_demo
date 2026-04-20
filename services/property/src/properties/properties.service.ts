import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.property.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }
}
