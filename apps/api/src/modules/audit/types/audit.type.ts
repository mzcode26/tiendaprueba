export type AuditLogWithUser = {
  id: string;
  tenantId: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string;
  before: any | null;
  after: any | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
};