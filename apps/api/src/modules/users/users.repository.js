"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UsersRepository = class UsersRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    safeSelect = {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        roles: {
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { permission: true },
                        },
                    },
                },
            },
        },
    };
    async findAll(tenantId, query) {
        const { search, isActive, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const where = {
            tenantId,
            deletedAt: null,
            ...(isActive !== undefined && { isActive }),
            ...(search && {
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };
        const [items, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: this.safeSelect,
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(id, tenantId) {
        return this.prisma.user.findFirst({
            where: { id, tenantId, deletedAt: null },
            select: this.safeSelect,
        });
    }
    async findByEmail(email, tenantId) {
        return this.prisma.user.findFirst({
            where: { email, tenantId, deletedAt: null },
            select: this.safeSelect,
        });
    }
    async create(tenantId, dto, hashedPassword) {
        return this.prisma.user.create({
            data: {
                tenantId,
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                passwordHash: hashedPassword,
                phone: dto.phone,
                isActive: dto.isActive ?? true,
                ...(dto.roleIds?.length && {
                    roles: {
                        create: dto.roleIds.map((roleId) => ({ roleId })),
                    },
                }),
            },
            select: this.safeSelect,
        });
    }
    async update(id, dto, hashedPassword) {
        return this.prisma.$transaction(async (tx) => {
            if (dto.roleIds !== undefined) {
                await tx.userRole.deleteMany({ where: { userId: id } });
                if (dto.roleIds.length > 0) {
                    await tx.userRole.createMany({
                        data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
                    });
                }
            }
            return tx.user.update({
                where: { id },
                data: {
                    ...(dto.firstName && { firstName: dto.firstName }),
                    ...(dto.lastName && { lastName: dto.lastName }),
                    ...(dto.email && { email: dto.email }),
                    ...(hashedPassword && { passwordHash: hashedPassword }),
                    ...(dto.phone !== undefined && { phone: dto.phone }),
                    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                },
                select: this.safeSelect,
            });
        });
    }
    async softDelete(id) {
        return this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersRepository);
