"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/generated/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const passwordHash = await bcryptjs_1.default.hash('Admin1234!', 10);
    const tenant = await prisma.tenant.upsert({
        where: { slug: 'demo-store' },
        update: {},
        create: {
            name: 'Demo Store',
            slug: 'demo-store',
            plan: 'pro',
            isActive: true,
        },
    });
    const permissions = [
        { name: 'view_auth', module: 'auth' },
        { name: 'create_auth', module: 'auth' },
        { name: 'edit_auth', module: 'auth' },
        { name: 'delete_auth', module: 'auth' },
        { name: 'view_products', module: 'products' },
        { name: 'create_products', module: 'products' },
        { name: 'edit_products', module: 'products' },
        { name: 'delete_products', module: 'products' },
        { name: 'view_inventory', module: 'inventory' },
        { name: 'create_inventory', module: 'inventory' },
        { name: 'edit_inventory', module: 'inventory' },
        { name: 'delete_inventory', module: 'inventory' },
        { name: 'view_sales', module: 'sales' },
        { name: 'create_sales', module: 'sales' },
        { name: 'edit_sales', module: 'sales' },
        { name: 'delete_sales', module: 'sales' },
        { name: 'view_customers', module: 'customers' },
        { name: 'create_customers', module: 'customers' },
        { name: 'edit_customers', module: 'customers' },
        { name: 'delete_customers', module: 'customers' },
        { name: 'view_reports', module: 'reports' },
        { name: 'create_reports', module: 'reports' },
        { name: 'edit_reports', module: 'reports' },
        { name: 'delete_reports', module: 'reports' },
        { name: 'cancel_sales', module: 'sales' },
        { name: 'refund_sales', module: 'sales' },
        { name: 'view_stores', module: 'stores' },
        { name: 'create_stores', module: 'stores' },
        { name: 'edit_stores', module: 'stores' },
        { name: 'delete_stores', module: 'stores' },
    ];
    const permissionRecords = await Promise.all(permissions.map((permission) => prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission,
    })));
    const adminRole = await prisma.role.upsert({
        where: {
            tenantId_name: {
                tenantId: tenant.id,
                name: 'Admin',
            },
        },
        update: {},
        create: {
            tenantId: tenant.id,
            name: 'Admin',
            description: 'Full access to the Tienda tenant',
            isSystem: true,
        },
    });
    const cashierRole = await prisma.role.upsert({
        where: {
            tenantId_name: {
                tenantId: tenant.id,
                name: 'Cashier',
            },
        },
        update: {},
        create: {
            tenantId: tenant.id,
            name: 'Cashier',
            description: 'Sales user for point of sale workflows',
            isSystem: true,
        },
    });
    await Promise.all(permissionRecords.map((permission) => prisma.rolePermission.upsert({
        where: {
            roleId_permissionId: {
                roleId: adminRole.id,
                permissionId: permission.id,
            },
        },
        update: {},
        create: {
            roleId: adminRole.id,
            permissionId: permission.id,
        },
    })));
    const salesPermissionNames = new Set([
        'view_sales',
        'create_sales',
        'edit_sales',
        'delete_sales',
        'view_customers',
        'create_customers',
        'edit_customers',
        'delete_customers',
    ]);
    await Promise.all(permissionRecords
        .filter((permission) => salesPermissionNames.has(permission.name))
        .map((permission) => prisma.rolePermission.upsert({
        where: {
            roleId_permissionId: {
                roleId: cashierRole.id,
                permissionId: permission.id,
            },
        },
        update: {},
        create: {
            roleId: cashierRole.id,
            permissionId: permission.id,
        },
    })));
    const adminUser = await prisma.user.upsert({
        where: {
            tenantId_email: {
                tenantId: tenant.id,
                email: 'admin@demo.com',
            },
        },
        update: {
            passwordHash,
            firstName: 'Admin',
            lastName: 'Demo',
            isActive: true,
        },
        create: {
            tenantId: tenant.id,
            email: 'admin@demo.com',
            passwordHash,
            firstName: 'Admin',
            lastName: 'Demo',
            isActive: true,
        },
    });
    const existingUserRole = await prisma.userRole.findFirst({
        where: {
            userId: adminUser.id,
            roleId: adminRole.id,
            storeId: null,
        },
    });
    if (!existingUserRole) {
        await prisma.userRole.create({
            data: {
                userId: adminUser.id,
                roleId: adminRole.id,
            },
        });
    }
    const existingStore = await prisma.store.findFirst({
        where: {
            tenantId: tenant.id,
            name: 'Main Store',
        },
    });
    if (!existingStore) {
        await prisma.store.create({
            data: {
                tenantId: tenant.id,
                name: 'Main Store',
                isActive: true,
            },
        });
    }
    console.log('Seed completed successfully');
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
