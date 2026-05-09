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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const customers_repository_1 = require("./customers.repository");
let CustomersService = class CustomersService {
    customersRepository;
    constructor(customersRepository) {
        this.customersRepository = customersRepository;
    }
    findAll(tenantId, query) {
        return this.customersRepository.findAll(tenantId, query);
    }
    async findById(id, tenantId) {
        const customer = await this.customersRepository.findById(id, tenantId);
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        return customer;
    }
    async create(tenantId, dto) {
        if (dto.email) {
            const existing = await this.customersRepository.findByEmail(dto.email, tenantId);
            if (existing) {
                throw new common_1.ConflictException('A customer with this email already exists');
            }
        }
        if (dto.taxId) {
            const existing = await this.customersRepository.findByTaxId(dto.taxId, tenantId);
            if (existing) {
                throw new common_1.ConflictException('A customer with this tax ID already exists');
            }
        }
        return this.customersRepository.create(tenantId, dto);
    }
    async update(id, tenantId, dto) {
        await this.findById(id, tenantId);
        if (dto.email) {
            const existing = await this.customersRepository.findByEmail(dto.email, tenantId);
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('A customer with this email already exists');
            }
        }
        if (dto.taxId) {
            const existing = await this.customersRepository.findByTaxId(dto.taxId, tenantId);
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('A customer with this tax ID already exists');
            }
        }
        return this.customersRepository.update(id, dto);
    }
    async getStats(id, tenantId) {
        await this.findById(id, tenantId);
        return this.customersRepository.getStats(id, tenantId);
    }
    async remove(id, tenantId) {
        await this.findById(id, tenantId);
        await this.customersRepository.softDelete(id);
        return { message: 'Customer deleted successfully' };
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [customers_repository_1.CustomersRepository])
], CustomersService);
