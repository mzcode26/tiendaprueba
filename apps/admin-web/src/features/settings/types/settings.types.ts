export interface TenantSettings {
  general: GeneralSettings;
  sales: SalesSettings;
  inventory: InventorySettings;
}


export interface GeneralSettings {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  currency: string;
  timezone: string;
  logoUrl?: string | null;
}

export interface SalesSettings {
  allowNegativeStock?: boolean;
  defaultTax?: number;
  invoicePrefix?: string;
}

export interface InventorySettings {
  lowStockThreshold?: number;
  trackMovements?: boolean;
}

export interface Store {
  id: string;
  tenantId: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStoreInput {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface UpdateStoreInput {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}