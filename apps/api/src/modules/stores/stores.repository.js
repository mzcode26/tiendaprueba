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
exports.StoresRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let StoresRepository = class StoresRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, includeInactive = false) {
        return this.prisma.store.findMany({
            where: {
                tenantId,
                deletedAt: null,
                ...(!includeInactive && { isActive: true }),
            },
            orderBy: { name: 'asc' },
        });
    }
    async findById(id, tenantId) {
        return this.prisma.store.findFirst({
            where: { id, tenantId, deletedAt: null },
        });
    }
    async create(tenantId, dto) {
        return this.prisma.store.create({
            data: {
                tenantId,
                name: dto.name,
                address: dto.address,
                phone: dto.phone,
                email: dto.email,
                isActive: dto.isActive ?? true,
            },
        });
    }
    async update(id, dto) {
        return this.prisma.store.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.address !== undefined && { address: dto.address }),
                ...(dto.phone !== undefined && { phone: dto.phone }),
                ...(dto.email !== undefined && { email: dto.email }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
        });
    }
    async softDelete(id) {
        return this.prisma.store.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.StoresRepository = StoresRepository;
exports.StoresRepository = StoresRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StoresRepository);
