import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserType } from './types/user.type';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  private sanitizeUser(user: any): UserType {
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      roles: user.roles.map((userRole: any) => ({
        id: userRole.role.id,
        name: userRole.role.name,
      })),
    };
  }

  async findById(id: string, tenantId: string) {
    const user = await this.usersRepository.findById(id, tenantId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitizeUser(user);
  }

  async findAll(tenantId: string, page: number, limit: number, search?: string) {
    const result = await this.usersRepository.findAll(tenantId, { page, limit, search });
    return {
      items: result.items.map((user: any) => this.sanitizeUser(user)),
      meta: result.meta,
    };
  }

  async create(tenantId: string, data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.usersRepository.create(tenantId, {
      ...data,
      password: hashedPassword,
    });
    return this.sanitizeUser({ ...user, roles: [] });
  }

  async update(id: string, tenantId: string, data: UpdateUserDto) {
    const updatePayload: any = { ...data };
    if (data.password) {
      updatePayload.passwordHash = await bcrypt.hash(data.password, 10);
      delete updatePayload.password;
    }
    await this.usersRepository.update(id, tenantId, updatePayload);
    return this.findById(id, tenantId);
  }

  async softDelete(id: string, tenantId: string) {
    await this.usersRepository.softDelete(id, tenantId);
    return { success: true, message: 'User deleted successfully' };
  }
}
