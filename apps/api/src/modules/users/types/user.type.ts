export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserFilters {
  search?: string;
  isActive?: boolean;
  roleId?: string;
  page?: number;
  limit?: number;
}