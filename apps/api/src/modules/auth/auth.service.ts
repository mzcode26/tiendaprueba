import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async generateToken(payload: Record<string, unknown>, expiresIn: string) {
    return this.jwtService.signAsync(payload, { expiresIn });
  }

  private buildUserResponse(user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles.map((userRole: any) => ({
        id: userRole.role.id,
        name: userRole.role.name,
      })),
    };
  }

  async login(tenantSlug: string, email: string, password: string) {
    const tenant = await this.authRepository.findTenantBySlug(tenantSlug);
    if (!tenant) {
      throw new UnauthorizedException('Invalid tenant or credentials');
    }

    const user = await this.authRepository.findUserByEmail(tenant.id, email);
    if (!user) {
      throw new UnauthorizedException('Invalid tenant or credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid tenant or credentials');
    }

    const accessToken = await this.generateToken(
      {
        sub: user.id,
        email: user.email,
        tenantId: tenant.id,
        type: 'access',
      },
      this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    );

    const refreshToken = await this.generateToken(
      {
        sub: user.id,
        email: user.email,
        tenantId: tenant.id,
        type: 'refresh',
      },
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.authRepository.saveRefreshToken(user.id, refreshTokenHash);
    await this.authRepository.updateLastLogin(user.id);

    return {
      accessToken,
      refreshToken,
      user: this.buildUserResponse(user),
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.generateToken(
      {
        sub: user.id,
        email: user.email,
        tenantId: user.tenantId,
        type: 'access',
      },
      this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    );

    const newRefreshToken = await this.generateToken(
      {
        sub: user.id,
        email: user.email,
        tenantId: user.tenantId,
        type: 'refresh',
      },
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    );

    const refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    await this.authRepository.saveRefreshToken(user.id, refreshTokenHash);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string) {
    await this.authRepository.saveRefreshToken(userId, null);
    return { success: true, message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.buildUserResponse(user);
  }

  async getUserPermissions(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      return [];
    }

    return user.roles.flatMap((userRole: any) =>
      userRole.role.permissions.map((rolePermission: any) => rolePermission.permission.name),
    );
  }
}
