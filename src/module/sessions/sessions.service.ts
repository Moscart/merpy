import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/database/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async revokeAllByUserId(userId: string) {
    await this.prismaService.sessions.deleteMany({
      where: { userId },
    });

    return { message: 'All sessions revoked successfully' };
  }
}
