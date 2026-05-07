export interface TenantSettings {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  currency: string;
  timezone: string;
  logoUrl?: string;
}

export interface StoreSettings {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
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