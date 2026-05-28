import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type SettingsValue = Record<string, any>;

const DEFAULT_SETTINGS: SettingsValue = {
  general: {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    currency: 'ARS',
    timezone: 'America/Argentina/Buenos_Aires',
    logoUrl: '',
  },
  sales: {},
  inventory: {},
};

function isPlainObject(value: unknown): value is Record<string, any> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Record<string, any>,
): T {
  const output: Record<string, any> = { ...target };

  for (const key of Object.keys(source)) {
    const targetValue = output[key];
    const sourceValue = source[key];

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      output[key] = deepMerge(targetValue, sourceValue);
    } else {
      output[key] = sourceValue;
    }
  }

  return output as T;
}

@Injectable()
export class SettingsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    const settings = tenant?.settings as SettingsValue | null | undefined;

    return deepMerge(DEFAULT_SETTINGS, settings ?? {});
  }

  async update(tenantId: string, settings: Record<string, any>) {
    const current = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    const currentSettings = (current?.settings as SettingsValue | null | undefined) ?? {};
    const mergedSettings = deepMerge(
      deepMerge(DEFAULT_SETTINGS, currentSettings),
      settings,
    );

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: mergedSettings },
      select: { settings: true },
    });

    return deepMerge(DEFAULT_SETTINGS, (updated.settings as SettingsValue | null | undefined) ?? {});
  }
}