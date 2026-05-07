import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SalesService } from '../sales/sales.service';
import { PosSearchDto, QuickSaleDto } from './dto/index';

@Injectable()
export class PosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly salesService: SalesService,
  ) {}

  async searchProducts(tenantId: string, data: PosSearchDto) {
    const { q, storeId, type = 'name' } = data;

    // Validate store belongs to tenant
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, tenantId, deletedAt: null },
    });
    if (!store) {
      throw new BadRequestException('Store not found');
    }

    let where: any = {
      tenantId,
      deletedAt: null,
    };

    // Build search conditions based on type
    if (type === 'barcode') {
      where.barcode = { contains: q, mode: 'insensitive' };
    } else if (type === 'sku') {
      where.variants = {
        some: {
          sku: { contains: q, mode: 'insensitive' },
          deletedAt: null,
        },
      };
    } else {
      where.name = { contains: q, mode: 'insensitive' };
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        variants: {
          where: { deletedAt: null },
          include: {
            inventory: {
              where: {
                storeId,
                tenantId,
                deletedAt: null,
              },
            },
          },
        },
        category: {
          select: { id: true, name: true },
        },
      },
      take: 50, // Limit results for POS performance
    });

    // Filter and format results for POS
    const results = products
      .filter((product: any) => product.variants.length > 0)
      .map((product: any) => ({
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        category: product.category,
        variants: product.variants.map((variant: any) => ({
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          cost: variant.cost,
          stock: variant.inventory[0]?.quantity || 0,
          reserved: variant.inventory[0]?.reservedQuantity || 0,
          available: (variant.inventory[0]?.quantity || 0) - (variant.inventory[0]?.reservedQuantity || 0),
        })),
      }));

    return results;
  }

  async quickSale(tenantId: string, userId: string, data: QuickSaleDto) {
    // Convert POS items to sales items
    const saleItems = data.items.map((item: any) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: 0, // Will be set by service
      discountAmount: item.discountAmount || 0,
    }));

    // Create sale using sales service
    return this.salesService.createSale(tenantId, userId, {
      storeId: data.storeId,
      customerId: data.customerId,
      items: saleItems,
      discountAmount: data.discountAmount || 0,
      notes: data.notes,
      // POS sales are typically paid immediately, but we'll let the service handle it
    });
  }

  async getPosData(tenantId: string, storeId: string) {
    // Get store info
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, tenantId, deletedAt: null },
      select: { id: true, name: true, address: true },
    });

    if (!store) {
      throw new BadRequestException('Store not found');
    }

    // Get recent customers for quick selection
    const customers = await this.prisma.customer.findMany({
      where: { tenantId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true, phone: true },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    // Get popular products for quick access
    const popularProducts = await this.prisma.product.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        variants: {
          where: { deletedAt: null },
          include: {
            inventory: {
              where: { storeId, tenantId, deletedAt: null },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    return {
      store,
      customers,
      popularProducts: popularProducts.map((product: any) => ({
        id: product.id,
        name: product.name,
        variants: product.variants.map((variant: any) => ({
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          stock: variant.inventory[0]?.quantity || 0,
        })),
      })),
    };
  }
}