export type UserRoleType = {
  id: string;
  name: string;
};

export type UserType = {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt?: Date | null;
  roles: UserRoleType[];
};
