export type TenantSettings = {
  general?: {
    currency?: string;
    timezone?: string;
    language?: string;
  };
  sales?: {
    defaultTaxRate?: number;
    enableInstallments?: boolean;
  };
  inventory?: {
    lowStockThreshold?: number;
    autoReorder?: boolean;
  };
};