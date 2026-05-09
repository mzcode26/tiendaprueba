"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcryptjs"));
const auth_repository_1 = require("./auth.repository");
let AuthService = class AuthService {
    authRepository;
    jwtService;
    configService;
    constructor(authRepository, jwtService, configService) {
        this.authRepository = authRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(dto, tenantId) {
        const user = await this.authRepository.findUserByEmail(dto.email, tenantId);
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const permissions = this.extractPermissions(user);
        const roles = user.roles.map((ur) => ur.role.name);
        const payload = {
            sub: user.id,
            email: user.email,
            tenantId: user.tenantId,
            roles,
            permissions,
        };
        const tokens = await this.generateTokens(payload);
        const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
        await this.authRepository.updateRefreshToken(user.id, refreshTokenHash);
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                tenantId: user.tenantId,
                roles,
                permissions,
            },
        };
    }
    async refresh(userId, refreshToken) {
        const user = await this.authRepository.findUserById(userId);
        if (!user || !user.refreshTokenHash || !user.isActive) {
            throw new common_1.UnauthorizedException('Access denied');
        }
        const tokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!tokenValid) {
            throw new common_1.UnauthorizedException('Access denied');
        }
        const permissions = this.extractPermissions(user);
        const roles = user.roles.map((ur) => ur.role.name);
        const payload = {
            sub: user.id,
            email: user.email,
            tenantId: user.tenantId,
            roles,
            permissions,
        };
        const tokens = await this.generateTokens(payload);
        const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
        await this.authRepository.updateRefreshToken(user.id, refreshTokenHash);
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                tenantId: user.tenantId,
                roles,
                permissions,
            },
        };
    }
    async logout(userId) {
        await this.authRepository.updateRefreshToken(userId, null);
    }
    async getProfile(userId) {
        const user = await this.authRepository.findUserById(userId);
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const permissions = this.extractPermissions(user);
        const roles = user.roles.map((ur) => ur.role.name);
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            tenantId: user.tenantId,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
            roles,
            permissions,
        };
    }
    extractPermissions(user) {
        const permSet = new Set();
        for (const ur of user.roles) {
            for (const rp of ur.role.permissions) {
                permSet.add(rp.permission.name);
            }
        }
        return Array.from(permSet);
    }
    async generateTokens(payload) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.getOrThrow('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRES_IN') ?? '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') ?? '7d',
            }),
        ]);
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_repository_1.AuthRepository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
