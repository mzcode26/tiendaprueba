export interface PaginationState {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const usePagination = (total: number, page: number, limit: number): PaginationState => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    total,
    page,
    limit,
    totalPages,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
  };
};
