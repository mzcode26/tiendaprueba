export type CustomerWithRelations = {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  documentType: string | null;
  documentNumber: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  _count: {
    sales: number;
  };
  sales?: {
    id: string;
    total: number;
    status: string;
    createdAt: Date;
  }[];
};