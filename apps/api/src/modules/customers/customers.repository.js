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
exports.CustomersRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CustomersRepository = class CustomersRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
                    { phone: { contains: search, mode: 'insensitive' } },
                    { taxId: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };
        const [items, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    city: true,
                    taxId: true,
                    isActive: true,
                    createdAt: true,
                    _count: { select: { sales: true } },
                },
            }),
            this.prisma.customer.count({ where }),
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
        return this.prisma.customer.findFirst({
            where: { id, tenantId, deletedAt: null },
            include: {
                sales: {
                    where: { deletedAt: null },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    select: {
                        id: true,
                        saleNumber: true,
                        total: true,
                        status: true,
                        createdAt: true,
                    },
                },
                _count: { select: { sales: true } },
            },
        });
    }
    async findByEmail(email, tenantId) {
        return this.prisma.customer.findFirst({
            where: { email, tenantId, deletedAt: null },
        });
    }
    async findByTaxId(taxId, tenantId) {
        return this.prisma.customer.findFirst({
            where: { taxId, tenantId, deletedAt: null },
        });
    }
    async create(tenantId, dto) {
        return this.prisma.customer.create({
            data: {
                tenantId,
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                phone: dto.phone,
                address: dto.address,
                city: dto.city,
                province: dto.province,
                postalCode: dto.postalCode,
                taxId: dto.taxId,
                birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
                gender: dto.gender,
                notes: dto.notes,
            },
        });
    }
    async update(id, dto) {
        return this.prisma.customer.update({
            where: { id },
            data: {
                ...(dto.firstName && { firstName: dto.firstName }),
                ...(dto.lastName && { lastName: dto.lastName }),
                ...(dto.email !== undefined && { email: dto.email }),
                ...(dto.phone !== undefined && { phone: dto.phone }),
                ...(dto.address !== undefined && { address: dto.address }),
                ...(dto.city !== undefined && { city: dto.city }),
                ...(dto.province !== undefined && { province: dto.province }),
                ...(dto.postalCode !== undefined && { postalCode: dto.postalCode }),
                ...(dto.taxId !== undefined && { taxId: dto.taxId }),
                ...(dto.birthDate && { birthDate: new Date(dto.birthDate) }),
                ...(dto.gender !== undefined && { gender: dto.gender }),
                ...(dto.notes !== undefined && { notes: dto.notes }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
        });
    }
    async getStats(id, tenantId) {
        const result = await this.prisma.sale.aggregate({
            where: {
                customerId: id,
                tenantId,
                status: 'COMPLETED',
                deletedAt: null,
            },
            _sum: { total: true },
            _count: { id: true },
            _avg: { total: true },
            _max: { createdAt: true },
        });
        return {
            totalPurchases: result._count.id,
            totalSpent: result._sum.total ?? 0,
            averageOrderValue: result._avg.total ?? 0,
            lastPurchaseAt: result._max.createdAt,
        };
    }
    async softDelete(id) {
        return this.prisma.customer.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.CustomersRepository = CustomersRepository;
exports.CustomersRepository = CustomersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersRepository);
