import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTenantBySlug(slug: string) {
    return this.prisma.tenant.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
    });
  }

  async findUserByEmail(tenantId: string, email: string) {
    return this.prisma.user.findFirst({
      where: {
        tenantId,
        email,
        isActive: true,
        deletedAt: null,
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findUserById(id: string) {
    return this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
        isActive: true,
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async saveRefreshToken(userId: string, tokenHash: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: tokenHash },
    });
  }

  async updateLastLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}
