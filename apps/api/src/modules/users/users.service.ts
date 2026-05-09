import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  findAll(tenantId: string, query: QueryUsersDto) {
    return this.usersRepository.findAll(tenantId, query);
  }

  async findById(id: string, tenantId: string) {
    const user = await this.usersRepository.findById(id, tenantId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(tenantId: string, dto: CreateUserDto) {
    const existing = await this.usersRepository.findByEmail(dto.email, tenantId);
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.usersRepository.create(tenantId, dto, hashedPassword);
  }

  async update(id: string, tenantId: string, dto: UpdateUserDto) {
    await this.findById(id, tenantId);

    if (dto.email) {
      const existing = await this.usersRepository.findByEmail(dto.email, tenantId);
      if (existing && existing.id !== id) {
        throw new ConflictException('A user with this email already exists');
      }
    }

    const hashedPassword = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : undefined;

    return this.usersRepository.update(id, dto, hashedPassword);
  }

  async remove(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    await this.usersRepository.softDelete(id);
    return { message: 'User deleted successfully' };
  }
}